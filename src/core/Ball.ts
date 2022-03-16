import bezier from 'bezier-easing'
import Game from '~/scenes/Game'
import { CourtPlayer } from './CourtPlayer'

interface BallConfig {
  position: {
    x: number
    y: number
  }
}

export class Ball {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  private player!: CourtPlayer | null

  constructor(game: Game, config: BallConfig) {
    this.game = game
    const { position } = config
    this.sprite = this.game.physics.add
      .sprite(position.x, position.y, 'ball')
      .setScale(0.05)
      .setDepth(100)
      .setBounce(0.5)
  }

  shoot() {
    this.player = null
    const hoopSprite = this.game.hoop.sprite
    const netBottom = new Phaser.Math.Vector2(hoopSprite.x, hoopSprite.y - 50)
    const rightRim = new Phaser.Math.Vector2(hoopSprite.x + 20, hoopSprite.y - 50)
    const leftRim = new Phaser.Math.Vector2(hoopSprite.x - 20, hoopSprite.y - 50)

    this.sprite.setGravityY(980)
    const time = 1.25
    const xVelocity = (leftRim.x - this.sprite.x) / time
    const yVelocity = (leftRim.y - this.sprite.y - 490 * Math.pow(time, 2)) / time
    this.sprite.setVelocity(xVelocity, yVelocity)
  }

  setPlayer(player: CourtPlayer) {
    this.player = player
  }

  update() {
    if (this.player) {
      this.sprite.x = this.player.sprite.x
      this.sprite.y = this.player.sprite.y
    }
  }
}
