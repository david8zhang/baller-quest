import { Ball } from '~/core/Ball'
import { CourtPlayer, Role } from '~/core/CourtPlayer'

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
  public static PLAYER_HOOP_CONFIG = {
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
    rimRange: [-80, -10],
    successShotRange: [-50, -45],
    isFlipX: true,
  }
  public static CPU_HOOP_CONFIG = {
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
    rimRange: [-80, -10],
    successShotRange: [-50, -45],
    isFlipX: false,
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

  public static getClosestPlayer(
    src: CourtPlayer,
    courtPlayers: CourtPlayer[],
    velocityVector: Phaser.Math.Vector2
  ) {
    let closestPlayer: any = null
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
}
