import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'

export class Hoop {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  constructor(game: Game) {
    this.game = game
    this.sprite = this.game.physics.add.sprite(Constants.GAME_WIDTH / 2, 150, 'hoop').setScale(0.1)
  }
}
