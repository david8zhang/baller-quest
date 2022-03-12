import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'

export class Hoop {
  private game: Game
  constructor(game: Game) {
    this.game = game
    const hoopSprite = this.game.add.sprite(Constants.GAME_WIDTH / 2, 50, 'hoop').setScale(0.1)
  }
}
