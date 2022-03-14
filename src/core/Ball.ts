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
  private sprite: Phaser.Physics.Arcade.Sprite
  private player!: CourtPlayer | null

  constructor(game: Game, config: BallConfig) {
    this.game = game
    const { position } = config
    this.sprite = this.game.physics.add
      .sprite(position.x, position.y, 'ball')
      .setScale(0.05)
      .setDepth(100)
  }

  shoot() {
    this.player = null

    this.game.graphics.lineStyle(1, 0x00ff00)
    const horizLineToHoop = new Phaser.Geom.Line()
    const hoopSprite = this.game.hoop.sprite
    horizLineToHoop.setTo(this.sprite.x, this.sprite.y, hoopSprite.x, this.sprite.y)

    const verticalLine = new Phaser.Geom.Line()
    const midPoint = {
      x: (this.sprite.x + hoopSprite.x) / 2,
      y: this.sprite.y,
    }
    verticalLine.setTo(midPoint.x, midPoint.y, midPoint.x, hoopSprite.y - 100)
    const verticalLine2 = new Phaser.Geom.Line()

    const quarterPoint = {
      x: (midPoint.x + hoopSprite.x) / 2,
      y: this.sprite.y,
    }
    verticalLine2.setTo(quarterPoint.x, midPoint.y, quarterPoint.x, hoopSprite.y - 150)

    // this.game.graphics.strokeLineShape(horizLineToHoop)
    // this.game.graphics.strokeLineShape(verticalLine)
    // this.game.graphics.strokeLineShape(verticalLine2)

    const arcPeakPoint = new Phaser.Math.Vector2(midPoint.x, hoopSprite.y - 100)
    const aboveBackboardPoint = new Phaser.Math.Vector2(
      (midPoint.x + hoopSprite.x) / 2,
      hoopSprite.y - 125
    )
    const backboardPoint = new Phaser.Math.Vector2(hoopSprite.x, hoopSprite.y - 25)
    const belowNetPoint = new Phaser.Math.Vector2(hoopSprite.x, hoopSprite.y + 100)

    const arcPath = new Phaser.Curves.Path(this.sprite.x, this.sprite.y).splineTo([
      arcPeakPoint,
      backboardPoint,
      belowNetPoint,
    ])
    // arcPath.draw(this.game.graphics)
    this.sprite.setVisible(false)
    const ballFollower = this.game.add
      .follower(arcPath, this.sprite.x, this.sprite.y, 'ball')
      .setScale(0.05)
    ballFollower.startFollow({
      duration: 1000,
    })
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
