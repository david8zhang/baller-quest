import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Team } from './teams/Team'

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
  THREE_POINTER = 'THREE',
  TWO_POINTER = 'TWO',
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

  public shotThreshold: ShotThreshold
  public currValue: number = 0
  private team: Team
  private game: Game
  private isShooting: boolean = false
  private keyE: Phaser.Input.Keyboard.Key
  private isLayup: boolean = false
  private bar: Phaser.GameObjects.Graphics
  private shotType!: ShotType

  constructor(game: Game, team: Team) {
    this.game = game
    this.team = team
    this.keyE = this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    this.setupInitialKeyPressListener()
    this.game.time.addEvent({
      repeat: -1,
      delay: 20,
      callback: () => {
        if (!this.isLayup && this.game.ball.getPossessionSide() === team.side) {
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
  }

  private setupInitialKeyPressListener() {
    this.game.input.keyboard.on('keydown', (e) => {
      const selectedCourtPlayer = this.team.getSelectedCourtPlayer()
      const opposingHoop = this.team.getOpposingTeam().getHoop()
      switch (e.code) {
        case 'KeyE': {
          const distanceToHoop = Constants.getDistanceBetween(
            {
              x: selectedCourtPlayer.sprite.x,
              y: selectedCourtPlayer.sprite.y,
            },
            {
              x: opposingHoop.sprite.x,
              y: opposingHoop.sprite.y,
            }
          )
          if (distanceToHoop < 150) {
            this.isLayup = true
            selectedCourtPlayer.shootBall(true, ShotType.TWO_POINTER)
            this.isLayup = false
          } else {
            const shotType = this.game.court.getShotType(
              {
                x: selectedCourtPlayer.sprite.x,
                y: selectedCourtPlayer.sprite.y,
              },
              this.team.driveDirection
            )
            if (shotType === ShotType.THREE_POINTER) {
              this.setupThreshold({ lowerBound: 25, upperBound: 35, perfectReleaseValue: 30 })
            }
            if (shotType === ShotType.TWO_POINTER) {
              this.setupThreshold({ lowerBound: 20, upperBound: 40, perfectReleaseValue: 30 })
            }
            this.shotType = shotType
          }
          break
        }
        default:
          break
      }
    })
  }

  public getOpenness() {}

  private windUpShot() {
    this.currValue += 2
    this.draw()
  }

  private draw() {
    this.bar.clear()

    // Background rectangle
    const selectedCourtPlayer = this.team.getSelectedCourtPlayer()
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
    const yPos = selectedCourtPlayer.sprite.y - 50
    const xPos = selectedCourtPlayer.sprite.x + 20
    this.bar.clear()
    this.bar.fillStyle(0x00ff00)
    this.bar.fillRect(xPos, yPos, ShotMeter.WIDTH, ShotMeter.MAX_LENGTH)
  }

  showShotMiss() {
    const selectedCourtPlayer = this.team.getSelectedCourtPlayer()
    const yPos = selectedCourtPlayer.sprite.y - 50
    const xPos = selectedCourtPlayer.sprite.x + 20
    this.bar.clear()
    this.bar.fillStyle(0xff0000)
    this.bar.fillRect(xPos, yPos, ShotMeter.WIDTH, ShotMeter.MAX_LENGTH)
  }

  private shoot() {
    const selectedCourtPlayer = this.team.getSelectedCourtPlayer()
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
      const randValue = Phaser.Math.Between(0, 100)
      const diff = this.currValue - this.shotThreshold.perfectReleaseValue
      const isSuccess = randValue <= 40
      const missType = diff < 0 ? MissType.UNDERSHOT : MissType.OVERSHOT
      selectedCourtPlayer.shootBall(isSuccess, this.shotType, missType)
    }
    this.game.time.delayedCall(1000, () => {
      this.bar.clear()
    })
    this.currValue = 0
  }
}
