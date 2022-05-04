import { Ball, BallState } from '~/core/Ball'
import { CourtPlayer, Role } from '~/core/CourtPlayer'
import { Hoop } from '~/core/Hoop'
import { MissType, ShotOpenness, ShotType } from '~/core/meters/ShotMeter'
import { DriveDirection, Side, Team } from '~/core/teams/Team'
import { LAST_NAMES, MALE_FIRST_NAMES } from './names'

export class Constants {
  public static GAME_WIDTH = 900
  public static GAME_HEIGHT = 630
  static FIELD_ZONE_WIDTH: number = 90
  static FIELD_ZONE_HEIGHT: number = 70

  public static COURT_WIDTH = Constants.GAME_WIDTH * 1.5
  public static COURT_HEIGHT = Constants.GAME_HEIGHT

  public static COURT_TOP_SIDE_BORDER = 100
  public static COURT_BOTTOM_SIDE_BORDER = Constants.COURT_HEIGHT - 80

  // Court Player attributes
  public static COURT_PLAYER_SPEED = 200
  public static COURT_PLAYER_DEFENSE_SPEED = 250
  public static COURT_PLAYER_SPRINT_SPEED = 300
  public static COURT_PLAYER_TIRED_SPEED = 150
  public static PASS_SPEED = 1000

  //Block, steal percentages
  public static BLOCK_SUCCESS_RATE = 30
  public static STEAL_SUCCESS_RATE = 20

  public static HOOP_LEFT = {
    position: {
      x: 125,
      y: Constants.COURT_HEIGHT / 2 - 125,
    },
    rimPosition: {
      x: 180,
      y: Constants.COURT_HEIGHT / 2 - 125,
    },
    backboardPosition: {
      x: 150,
      y: Constants.COURT_HEIGHT / 2 - 150,
    },
    rimRange: [40, 60],
    successShotRange: [73, 73],
    isFlipX: false,
    driveDirection: DriveDirection.LEFT,
  }
  public static HOOP_RIGHT = {
    position: {
      x: Constants.COURT_WIDTH - 125,
      y: Constants.COURT_HEIGHT / 2 - 125,
    },
    rimPosition: {
      x: Constants.COURT_WIDTH - 180,
      y: Constants.COURT_HEIGHT / 2 - 125,
    },
    backboardPosition: {
      x: Constants.COURT_WIDTH - 150,
      y: Constants.COURT_HEIGHT / 2 - 125,
    },
    rimRange: [-60, -40],
    successShotRange: [-73, -73],
    isFlipX: true,
    driveDirection: DriveDirection.RIGHT,
  }

  // Team attributes
  public static LEFT = [
    { zoneId: 68, role: Role.C },
    { zoneId: 36, role: Role.SG },
    { zoneId: 98, role: Role.SF },
    { zoneId: 82, role: Role.PF },
    { zoneId: 70, role: Role.PG },
  ]
  public static RIGHT = [
    { zoneId: 66, role: Role.C },
    { zoneId: 38, role: Role.SG },
    { zoneId: 96, role: Role.SF },
    { zoneId: 52, role: Role.PF },
    { zoneId: 64, role: Role.PG },
  ]

  // Offensive positions
  public static OFFENSE_FROM_RIGHT = {
    [Role.PG]: 69,
    [Role.SG]: 41,
    [Role.SF]: 101,
    [Role.PF]: 87,
    [Role.C]: 57,
  }
  public static OFFENSE_FROM_LEFT = {
    [Role.PG]: 65,
    [Role.SG]: 33,
    [Role.SF]: 93,
    [Role.PF]: 77,
    [Role.C]: 47,
  }

  // Player to tipoff to
  public static TIPOFF_RIGHT = 70
  public static TIPOFF_LEFT = 64

  // Zones for shot types right side
  public static MID_RANGE_RIGHT = [56, 71, 86, 87, 103, 102, 55, 70, 85]
  public static LAYUP_RANGE_RIGHT = [57, 72, 73, 88]
  public static THREE_POINT_RANGE_RIGHT = [
    38, 39, 40, 41, 42, 53, 54, 68, 69, 83, 84, 98, 99, 100, 101, 113, 114, 115, 116, 117, 118, 119,
  ]

  // Zone for shot types left side
  public static MID_RANGE_LEFT = [48, 49, 63, 64, 76, 77, 78, 79, 91, 92]
  public static LAYUP_RANGE_LEFT = [75, 61, 62, 47]
  public static THREE_POINT_RANGE_LEFT = [
    32, 33, 34, 35, 36, 50, 65, 80, 95, 94, 93, 107, 106, 105, 109, 110, 111, 96, 81, 66, 51, 36,
  ]

  public static ALL_INBOUND_ZONES = [
    47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102,
  ]

  public static SHOT_OPENNESS_THRESHOLDS = {
    [ShotType.LAYUP]: 50,
    [ShotType.MID_RANGE]: 75,
    [ShotType.THREE_POINTER]: 120,
  }

  public static SHOT_PERCENTAGES = {
    [ShotOpenness.WIDE_OPEN]: {
      [ShotType.LAYUP]: {
        percentage: 90,
      },
      [ShotType.MID_RANGE]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 25,
          lowerBound: 10,
        },
        percentage: 60,
      },
      [ShotType.THREE_POINTER]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 30,
          lowerBound: 20,
        },
        percentage: 45,
      },
      [ShotType.HALF_COURT_PRAYER]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 37,
          lowerBound: 34,
        },
        percentage: 15,
      },
    },
    [ShotOpenness.OPEN]: {
      [ShotType.LAYUP]: {
        percentage: 60,
      },
      [ShotType.MID_RANGE]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 30,
          lowerBound: 20,
        },
        percentage: 50,
      },
      [ShotType.THREE_POINTER]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 32,
          lowerBound: 24,
        },
        percentage: 40,
      },
      [ShotType.HALF_COURT_PRAYER]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 39,
          lowerBound: 38,
        },
        percentage: 10,
      },
    },
    [ShotOpenness.CONTESTED]: {
      [ShotType.LAYUP]: {
        percentage: 35,
      },
      [ShotType.MID_RANGE]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 32,
          lowerBound: 24,
        },
        percentage: 25,
      },
      [ShotType.THREE_POINTER]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 35,
          lowerBound: 30,
        },
        percentage: 20,
      },
      [ShotType.HALF_COURT_PRAYER]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 39,
          lowerBound: 38,
        },
        percentage: 5,
      },
    },

    [ShotOpenness.SMOTHERED]: {
      [ShotType.LAYUP]: {
        percentage: 20,
      },
      [ShotType.MID_RANGE]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 35,
          lowerBound: 30,
        },
        percentage: 15,
      },
      [ShotType.THREE_POINTER]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 37,
          lowerBound: 34,
        },
        percentage: 10,
      },
      [ShotType.HALF_COURT_PRAYER]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 40,
          lowerBound: 40,
        },
        percentage: 1,
      },
    },
  }

  public static SHOT_ARC_CONFIG = {
    [ShotType.HALF_COURT_PRAYER]: 1.35,
    [ShotType.THREE_POINTER]: 1.25,
    [ShotType.MID_RANGE]: 1,
    [ShotType.LAYUP]: 0.8,
  }

  public static DIGIT_TO_ROLE_MAPPING = [Role.PG, Role.SG, Role.SF, Role.PF, Role.C]

  public static getClosestPlayerToBall(ball: Ball, courtPlayers: CourtPlayer[]) {
    let closestPlayer: any = null
    let shortestDistance = Number.MAX_SAFE_INTEGER
    const ballPosition = new Phaser.Math.Vector2(ball.sprite.x, ball.sprite.y)
    courtPlayers.forEach((p: CourtPlayer) => {
      const position = new Phaser.Math.Vector2(p.sprite.x, p.sprite.y)
      const distance = Phaser.Math.Distance.BetweenPoints(ballPosition, position)
      if (distance < shortestDistance) {
        shortestDistance = distance
        closestPlayer = p
      }
    })
    return closestPlayer
  }

  public static getClosestPlayer(src: CourtPlayer, courtPlayers: CourtPlayer[]) {
    let closestPlayer: any = null
    const velocityVector = src.currVelocityVector
    let shortestDistance = Number.MAX_SAFE_INTEGER
    const srcPosition = new Phaser.Math.Vector2(
      src.sprite.x + velocityVector.x,
      src.sprite.y + velocityVector.y
    )
    courtPlayers.forEach((p: CourtPlayer) => {
      if (p !== src) {
        const position = new Phaser.Math.Vector2(p.sprite.x, p.sprite.y)
        const distance = Phaser.Math.Distance.BetweenPoints(srcPosition, position)
        if (distance < shortestDistance) {
          shortestDistance = distance
          closestPlayer = p
        }
      }
    })
    return closestPlayer
  }

  public static getDistanceBetween(
    point1: { x: number; y: number },
    point2: { x: number; y: number }
  ) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2))
  }

  public static IsAtPosition(
    player: CourtPlayer,
    position: { x: number; y: number },
    threshold: number = 5
  ) {
    return (
      Constants.getDistanceBetween(
        {
          x: player.sprite.x,
          y: player.sprite.y,
        },
        {
          x: position.x,
          y: position.y,
        }
      ) < threshold
    )
  }

  public static generateRandomName() {
    const firstName = MALE_FIRST_NAMES[Phaser.Math.Between(0, MALE_FIRST_NAMES.length - 1)]
    const lastName = LAST_NAMES[Phaser.Math.Between(0, LAST_NAMES.length - 1)]
    return `${firstName} ${lastName}`
  }

  public static getSuccessBasedOnPercentage(percentage: number) {
    const randValue = Phaser.Math.Between(1, 100)
    return randValue <= percentage
  }

  public static getRandomMissType(): MissType {
    return Phaser.Math.Between(0, 1) == 0 ? MissType.UNDERSHOT : MissType.OVERSHOT
  }

  public static playerHasOpenShot(
    currPlayer: CourtPlayer,
    playerToDefend?: CourtPlayer,
    threshold?: number
  ) {
    if (!playerToDefend) {
      return true
    }
    const distanceToDefender = Constants.getDistanceBetween(
      {
        x: currPlayer.sprite.x,
        y: currPlayer.sprite.y,
      },
      {
        x: playerToDefend.sprite.x,
        y: playerToDefend.sprite.y,
      }
    )
    const distanceThreshold = threshold ? threshold : 100
    return distanceToDefender > distanceThreshold
  }

  public static getZonesForDriveDirection(driveDirection: DriveDirection) {
    const allRightZones = Constants.MID_RANGE_LEFT
    const allLeftZones = Constants.MID_RANGE_RIGHT
    return driveDirection === DriveDirection.LEFT ? allLeftZones : allRightZones
  }

  public static getZoneToDriveTo(player: CourtPlayer): number {
    const driveDirection = player.team.driveDirection
    const layupZones =
      driveDirection === DriveDirection.LEFT ? this.LAYUP_RANGE_RIGHT : this.LAYUP_RANGE_LEFT
    const opposingPlayers = player.team.getOpposingTeam().courtPlayers
    let zoneToDriveTowards: number = -1
    layupZones.forEach((zoneId: number) => {
      const zone = player.game.court.getZoneForZoneId(zoneId)
      if (zone) {
        const rayToZone = new Phaser.Geom.Line(
          player.sprite.x,
          player.sprite.y,
          zone.centerPosition.x,
          zone.centerPosition.y
        )
        let isLaneOpen = true
        opposingPlayers.forEach((courtPlayer: CourtPlayer) => {
          if (Phaser.Geom.Intersects.LineToRectangle(rayToZone, courtPlayer)) {
            isLaneOpen = false
          }
        })
        if (isLaneOpen) {
          zoneToDriveTowards = zoneId
        }
      }
    })
    return zoneToDriveTowards
  }

  static getOpennessBasedOnDistance(distance: number) {
    if (distance >= 150) {
      return ShotOpenness.OPEN
    } else if (distance < 150 && distance >= 50) {
      return ShotOpenness.CONTESTED
    } else {
      return ShotOpenness.SMOTHERED
    }
  }
}
