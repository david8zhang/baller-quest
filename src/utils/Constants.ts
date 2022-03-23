import { Ball } from '~/core/Ball'
import { CourtPlayer } from '~/core/CourtPlayer'

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

  // Team attributes
  public static RIGHT_SIDE = [68, 36, 98, 82, 70]
  public static LEFT_SIDE = [66, 38, 96, 52, 64]

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
    let shortestDistance = Number.MAX_SAFE_INTEGER
    const srcPosition = new Phaser.Math.Vector2(
      src.sprite.x + src.sprite.body.velocity.x,
      src.sprite.y + src.sprite.body.velocity.y
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
}
