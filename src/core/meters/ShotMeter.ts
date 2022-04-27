import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { BallState } from '../Ball'
import { Court } from '../Court'
import { CourtPlayer } from '../CourtPlayer'
import { Hoop } from '../Hoop'
import { PlayerTeam } from '../teams/PlayerTeam'
import { DriveDirection, Team } from '../teams/Team'

export interface ShotThreshold {
  lowerBound: number
  upperBound: number
  perfectReleaseValue: number
}

export enum ShotOpenness {
  WIDE_OPEN = 'WideOpen',
  OPEN = 'Open',
  CONTESTED = 'Contested',
  SMOTHERED = 'Smothered',
}

export enum ShotType {
  HALF_COURT_PRAYER = 'HALF_COURT_PRAYER',
  THREE_POINTER = 'THREE_POINTER',
  MID_RANGE = 'MID_RANGE',
  LAYUP = 'LAYUP',
}

export interface ShotConfig {
  shotType: ShotType
  missType?: MissType
  isSuccess: boolean
}

export enum MissType {
  OVERSHOT = 'Overshot',
  UNDERSHOT = 'Undershot',
}

export class ShotMeter {
  private static MAX_LENGTH = 60
  private static WIDTH = 10

  public shotThreshold!: ShotThreshold
  public currValue: number = 0
  private team: PlayerTeam
  private game: Game
  private isShooting: boolean = false
  private keyE: Phaser.Input.Keyboard.Key
  private bar!: Phaser.GameObjects.Graphics
  private shotType!: ShotType
  private shotOpenness!: ShotOpenness
  public detectShotEvent!: Phaser.Time.TimerEvent
  public hasSetupShotPercentages: boolean = false

  constructor(team: PlayerTeam, game: Game) {
    this.game = game
    this.team = team
    this.keyE = this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    this.detectShotEvent = this.game.time.addEvent({
      repeat: -1,
      delay: 20,
      callback: () => {
        if (this.game.ball.getPossessionSide() === team.side) {
          if (this.keyE.isDown) {
            this.windUpShot()
            this.isShooting = true
          }
          if (this.keyE.isUp && this.isShooting) {
            this.shoot()
            this.isShooting = false
          }
        }
      },
    })
    this.shotThreshold = {
      lowerBound: 20,
      perfectReleaseValue: 30,
      upperBound: 40,
    }
    this.bar = new Phaser.GameObjects.Graphics(this.game)
    this.bar.setDepth(100)
    this.game.add.existing(this.bar)
    this.setupInitialKeyPressListener()
  }

  private setupInitialKeyPressListener() {
    this.game.input.keyboard.on('keydown', (e) => {
      switch (e.code) {
        case 'KeyE': {
          if (!this.hasSetupShotPercentages) {
            this.hasSetupShotPercentages = true
            this.handleShotWithMeter()
          }
          break
        }
        default:
          break
      }
    })
  }

  public handleShotWithMeter() {
    const selectedCourtPlayer = this.team.getSelectedCourtPlayer()
    if (!selectedCourtPlayer) {
      return
    }
    const openness = ShotMeter.getOpenness(selectedCourtPlayer, this.team)
    const shotType = ShotMeter.getShotType(
      {
        x: selectedCourtPlayer.sprite.x,
        y: selectedCourtPlayer.sprite.y,
      },
      this.team.driveDirection,
      this.team.game.court
    ) as ShotType
    const shotPercentages = Constants.SHOT_PERCENTAGES[openness]
    if (shotType === ShotType.LAYUP) {
      const { percentage } = shotPercentages[shotType]
      this.detectShotEvent.paused = true
      const isSuccess = Constants.getSuccessBasedOnPercentage(percentage)
      selectedCourtPlayer.shootBall(isSuccess, shotType)
      this.postShotCleanup()
    } else {
      const { threshold } = shotPercentages[shotType]
      this.setupThreshold(threshold)
    }
    this.shotOpenness = openness
    this.shotType = shotType
    console.log(openness, shotType)
  }

  public static getGuardingPlayers(selectedCourtPlayer: CourtPlayer, team: Team) {
    const linesToHoop: Phaser.Geom.Line[] = []
    const hoop = team.getOpposingTeam().getHoop()
    for (let i = 50; i >= -50; i -= 10) {
      const line = new Phaser.Geom.Line(
        selectedCourtPlayer.sprite.x,
        selectedCourtPlayer.sprite.y,
        hoop.sprite.x,
        hoop.sprite.y - i
      )
      linesToHoop.push(line)
    }
    const enemyPlayers = team.getOpposingTeam().courtPlayers

    let guardingPlayer: any = null
    let minDistance = Number.MAX_SAFE_INTEGER
    enemyPlayers.forEach((enemyPlayer: CourtPlayer) => {
      linesToHoop.forEach((lineToHoop: Phaser.Geom.Line) => {
        if (Phaser.Geom.Intersects.LineToRectangle(lineToHoop, enemyPlayer.markerRectangle)) {
          const distToPlayer = Constants.getDistanceBetween(
            {
              x: selectedCourtPlayer.sprite.x,
              y: selectedCourtPlayer.sprite.y,
            },
            {
              x: enemyPlayer.sprite.x,
              y: enemyPlayer.sprite.y,
            }
          )
          if (!guardingPlayer) {
            minDistance = distToPlayer
            guardingPlayer = enemyPlayer
          } else {
            if (distToPlayer < minDistance) {
              minDistance = distToPlayer
              guardingPlayer = enemyPlayer
            }
          }
        }
      })
    })
    return guardingPlayer
  }

  public static getOpenness(selectedCourtPlayer: CourtPlayer, team: Team) {
    const guardingPlayer = this.getGuardingPlayers(selectedCourtPlayer, team)
    if (!guardingPlayer) {
      return ShotOpenness.WIDE_OPEN
    } else {
      const distanceToGuardingPlayer = Constants.getDistanceBetween(
        {
          x: selectedCourtPlayer.sprite.x,
          y: selectedCourtPlayer.sprite.y,
        },
        {
          x: guardingPlayer.sprite.x,
          y: guardingPlayer.sprite.y,
        }
      )
      if (distanceToGuardingPlayer >= 150) {
        return ShotOpenness.OPEN
      } else if (distanceToGuardingPlayer < 150 && distanceToGuardingPlayer >= 50) {
        return ShotOpenness.CONTESTED
      } else {
        return ShotOpenness.SMOTHERED
      }
    }
  }

  private windUpShot() {
    this.game.ball.setBallState(BallState.WIND_UP_SHOT)
    this.currValue += 2
    this.draw()
  }

  private draw() {
    const selectedCourtPlayer = this.team.getSelectedCourtPlayer()
    if (!selectedCourtPlayer) {
      return
    }
    this.bar.clear()

    // Background rectangle
    const percentage = this.currValue / this.shotThreshold.upperBound
    const length = Math.min(ShotMeter.MAX_LENGTH, Math.floor(percentage * ShotMeter.MAX_LENGTH))
    this.bar.fillStyle(0xdddddd)
    const yPos = selectedCourtPlayer.sprite.y - 50
    const xPos = selectedCourtPlayer.sprite.x + 20
    this.bar.fillRect(xPos, yPos, ShotMeter.WIDTH, ShotMeter.MAX_LENGTH)

    // Show thresholds
    this.bar.fillStyle(0xf1c40f)
    const thresholdLength =
      ((this.shotThreshold.upperBound - this.shotThreshold.lowerBound) /
        this.shotThreshold.upperBound) *
      ShotMeter.MAX_LENGTH
    const thresholdStart =
      (this.shotThreshold.lowerBound / this.shotThreshold.upperBound) * ShotMeter.MAX_LENGTH
    this.bar.fillRect(
      xPos,
      yPos + (ShotMeter.MAX_LENGTH - thresholdStart - thresholdLength),
      ShotMeter.WIDTH,
      thresholdLength
    )

    // Show power meter
    this.bar.fillStyle(0xf39c12)
    this.bar.fillRect(xPos, yPos + (ShotMeter.MAX_LENGTH - length), ShotMeter.WIDTH, length)

    // Show perfect release rectangle
    this.bar.fillStyle(0x000000)
    const perfectReleaseMark = Math.floor(
      (this.shotThreshold.perfectReleaseValue / this.shotThreshold.upperBound) *
        ShotMeter.MAX_LENGTH
    )
    this.bar.fillRect(xPos, yPos + (ShotMeter.MAX_LENGTH - perfectReleaseMark), ShotMeter.WIDTH, 2)
  }

  setupThreshold(threshold: ShotThreshold) {
    this.shotThreshold = threshold
  }

  showPerfectRelease() {
    const selectedCourtPlayer = this.team.getSelectedCourtPlayer()
    if (!selectedCourtPlayer) {
      return
    }
    const yPos = selectedCourtPlayer.sprite.y - 50
    const xPos = selectedCourtPlayer.sprite.x + 20
    this.bar.clear()
    this.bar.fillStyle(0x00ff00)
    this.bar.fillRect(xPos, yPos, ShotMeter.WIDTH, ShotMeter.MAX_LENGTH)
  }

  showShotMiss() {
    const selectedCourtPlayer = this.team.getSelectedCourtPlayer()
    if (!selectedCourtPlayer) {
      return
    }
    const yPos = selectedCourtPlayer.sprite.y - 50
    const xPos = selectedCourtPlayer.sprite.x + 20
    this.bar.clear()
    this.bar.fillStyle(0xff0000)
    this.bar.fillRect(xPos, yPos, ShotMeter.WIDTH, ShotMeter.MAX_LENGTH)
  }

  private shoot() {
    const selectedCourtPlayer = this.team.getSelectedCourtPlayer()
    if (!selectedCourtPlayer) {
      return
    }
    const diff = this.currValue - this.shotThreshold.perfectReleaseValue
    if (this.currValue < this.shotThreshold.lowerBound) {
      this.showShotMiss()
      selectedCourtPlayer.shootBall(false, this.shotType, MissType.UNDERSHOT)
    } else if (this.currValue > this.shotThreshold.upperBound) {
      this.showShotMiss()
      selectedCourtPlayer.shootBall(false, this.shotType, MissType.OVERSHOT)
    } else if (this.currValue === this.shotThreshold.perfectReleaseValue) {
      this.showPerfectRelease()
      selectedCourtPlayer.shootBall(true, this.shotType)
    } else {
      const missType = diff < 0 ? MissType.UNDERSHOT : MissType.OVERSHOT
      const percentage = Constants.SHOT_PERCENTAGES[this.shotOpenness][this.shotType].percentage
      const isSuccess = Constants.getSuccessBasedOnPercentage(percentage)
      selectedCourtPlayer.shootBall(isSuccess, this.shotType, missType)
    }
    if (diff == 0) {
      console.log('Perfect!')
    } else {
      console.log(diff < 0 ? 'Early' : 'Late')
    }
    this.postShotCleanup()
  }

  postShotCleanup() {
    // Post shot cleanup
    this.hasSetupShotPercentages = false
    this.game.time.delayedCall(1000, () => {
      this.bar.clear()
    })
    this.detectShotEvent.paused = false
    this.currValue = 0
  }

  public static getShotType(
    position: { x: number; y: number },
    driveDirection: DriveDirection,
    court: Court
  ): ShotType {
    const allZones = {
      [ShotType.MID_RANGE]:
        driveDirection === DriveDirection.LEFT
          ? Constants.MID_RANGE_RIGHT
          : Constants.MID_RANGE_LEFT,
      [ShotType.THREE_POINTER]:
        driveDirection === DriveDirection.LEFT
          ? Constants.THREE_POINT_RANGE_RIGHT
          : Constants.THREE_POINT_RANGE_LEFT,
      [ShotType.LAYUP]:
        driveDirection === DriveDirection.LEFT
          ? Constants.LAYUP_RANGE_RIGHT
          : Constants.LAYUP_RANGE_LEFT,
    }
    const playerZone = court.getNearestZoneForPosition(position)
    let shotType: ShotType = ShotType.HALF_COURT_PRAYER
    Object.keys(allZones).forEach((key) => {
      const zones = allZones[key]
      if (zones.includes(playerZone)) {
        shotType = key as ShotType
      }
    })
    return shotType as ShotType
  }
}
