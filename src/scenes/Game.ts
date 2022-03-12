import Phaser from 'phaser'
import { Ball } from '~/core/Ball'
import { Hoop } from '~/core/Hoop'
import { Player } from '~/core/Player'
import { Constants } from '~/utils/Constants'

export default class Game extends Phaser.Scene {
  private player!: Player
  private hoop!: Hoop
  private ball!: Ball

  constructor() {
    super('game')
  }

  create() {
    this.player = new Player(this)
    this.hoop = new Hoop(this)
    this.ball = new Ball(this, {
      position: {
        x: Constants.GAME_WIDTH / 2,
        y: Constants.GAME_HEIGHT / 2,
      },
    })
  }

  update() {
    this.player.update()
  }
}
