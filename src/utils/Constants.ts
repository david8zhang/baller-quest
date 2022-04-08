import { Ball } from '~/core/Ball'
import { CourtPlayer, Role } from '~/core/CourtPlayer'
import { MissType, ShotOpenness, ShotType } from '~/core/ShotMeter'
import { DriveDirection } from '~/core/teams/Team'
import { LAST_NAMES, MALE_FIRST_NAMES } from './names'

export class Constants {
  public static GAME_WIDTH = 900
  public static GAME_HEIGHT = 630
  static FIELD_ZONE_WIDTH: number = 90
  static FIELD_ZONE_HEIGHT: number = 70

  public static COURT_WIDTH = Constants.GAME_WIDTH * 1.5
  public static COURT_HEIGHT = Constants.GAME_HEIGHT

  // Court Player attributes
  public static COURT_PLAYER_SPEED = 200
  public static PASS_SPEED = 1000
  public static HOOP_LEFT = {
    position: {
      x: 50,
      y: Constants.COURT_HEIGHT / 2 - 50,
    },
    body: {
      offsetX: 250,
      offsetY: 75,
    },
    backboardPosition: {
      x: 75,
      y: Constants.COURT_HEIGHT / 2 - 125,
    },
    rimRange: [40, 60],
    successShotRange: [50, 50],
    isFlipX: true,
    driveDirection: DriveDirection.LEFT,
  }
  public static HOOP_RIGHT = {
    position: {
      x: Constants.COURT_WIDTH - 50,
      y: Constants.COURT_HEIGHT / 2 - 50,
    },
    body: {
      offsetX: -150,
      offsetY: 75,
    },
    backboardPosition: {
      x: Constants.COURT_WIDTH - 75,
      y: Constants.COURT_HEIGHT / 2 - 125,
    },
    rimRange: [-60, -40],
    successShotRange: [-52, -52],
    isFlipX: false,
    driveDirection: DriveDirection.RIGHT,
  }

  // Team attributes
  public static RIGHT_SIDE = [
    { zoneId: 68, role: Role.C },
    { zoneId: 36, role: Role.SG },
    { zoneId: 98, role: Role.SF },
    { zoneId: 82, role: Role.PF },
    { zoneId: 70, role: Role.PG },
  ]
  public static LEFT_SIDE = [
    { zoneId: 66, role: Role.C },
    { zoneId: 38, role: Role.SG },
    { zoneId: 96, role: Role.SF },
    { zoneId: 52, role: Role.PF },
    { zoneId: 64, role: Role.PG },
  ]

  // Offensive positions
  public static OFFENSE_FROM_LEFT = {
    [Role.PG]: 69,
    [Role.SG]: 26,
    [Role.SF]: 116,
    [Role.PF]: 87,
    [Role.C]: 57,
  }
  public static OFFENSE_FROM_RIGHT = {
    [Role.PG]: 65,
    [Role.SG]: 18,
    [Role.SF]: 108,
    [Role.PF]: 77,
    [Role.C]: 47,
  }

  // Player to tipoff to
  public static TIPOFF_RIGHT = 70
  public static TIPOFF_LEFT = 64

  // Zones for shot types left side
  public static MID_RANGE_LEFT = [
    15, 16, 17, 30, 31, 32, 33, 47, 48, 49, 62, 63, 64, 77, 78, 79, 90, 91, 92, 93, 105, 106, 107,
  ]
  public static LAYUP_RANGE_LEFT = [45, 46, 60, 61, 75, 76]
  public static THREE_POINT_RANGE_LEFT = [
    0, 1, 2, 3, 4, 5, 6, 18, 19, 20, 21, 34, 35, 36, 50, 51, 65, 66, 80, 81, 94, 95, 96, 108, 109,
    110, 11, 120, 121, 122, 123, 124, 125, 126,
  ]

  // Zone for shot types right side
  public static MID_RANGE_RIGHT = [
    27, 28, 29, 41, 42, 43, 44, 55, 56, 57, 70, 71, 72, 85, 86, 87, 101, 102, 103, 104, 117, 118,
    119,
  ]
  public static LAYUP_RANGE_RIGHT = [58, 59, 73, 74, 88, 89]
  public static THREE_POINT_RANGE_RIGHT = [
    8, 9, 10, 11, 12, 13, 14, 23, 24, 25, 26, 38, 39, 40, 53, 54, 68, 69, 83, 84, 98, 99, 100, 113,
    114, 115, 116, 128, 129, 130, 131, 132, 133, 134,
  ]

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
        percentage: 80,
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
        percentage: 65,
      },
      [ShotType.MID_RANGE]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 32,
          lowerBound: 24,
        },
        percentage: 45,
      },
      [ShotType.THREE_POINTER]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 35,
          lowerBound: 30,
        },
        percentage: 35,
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
        percentage: 50,
      },
      [ShotType.MID_RANGE]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 35,
          lowerBound: 30,
        },
        percentage: 40,
      },
      [ShotType.THREE_POINTER]: {
        threshold: {
          upperBound: 40,
          perfectReleaseValue: 37,
          lowerBound: 34,
        },
        percentage: 25,
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
}
