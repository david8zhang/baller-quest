import Phaser from 'phaser'
import { Ball } from '~/core/Ball'
import { Hoop } from '~/core/Hoop'
import { Player } from '~/core/Player'
import { Constants } from '~/utils/Constants'

export default class Game extends Phaser.Scene {
  private player!: Player
  public hoop!: Hoop
  public ball!: Ball
  public graphics!: Phaser.GameObjects.Graphics

  constructor() {
    super('game')
  }

  create() {
    const image = this.add.image(
      Constants.GAME_WIDTH / 2,
      Constants.GAME_HEIGHT / 2 + 200,
      'half-court'
    )
    image.displayWidth = Constants.GAME_WIDTH
    image.displayHeight = Constants.GAME_HEIGHT
    this.cameras.main.setBackgroundColor(0xffffff)

    this.ball = new Ball(this, {
      position: {
        x: Constants.GAME_WIDTH / 2,
        y: Constants.GAME_HEIGHT / 2,
      },
    })
    this.hoop = new Hoop(this)
    this.player = new Player(this)
    this.graphics = this.add.graphics()
  }

  update() {
    this.player.update()
    this.ball.update()
  }
}
