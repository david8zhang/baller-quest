import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'

export class Hoop {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  constructor(game: Game) {
    this.game = game
    this.sprite = this.game.physics.add.sprite(Constants.GAME_WIDTH / 2, 150, 'hoop').setScale(0.1)
    this.sprite.body.setSize(0.5 * this.sprite.body.width, 0.5 * this.sprite.body.width)
    this.sprite.body.offset.y = this.sprite.height * 0.5 - 200
    this.sprite.setPushable(false)
    this.game.physics.add.collider(this.sprite, this.game.ball.sprite)
  }
}
