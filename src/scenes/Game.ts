import Phaser from 'phaser'
import { Ball } from '~/core/Ball'
import { Hoop } from '~/core/Hoop'
import { GamePlayer } from '~/core/GamePlayer'
import { Constants } from '~/utils/Constants'
import { Debug } from '~/core/Debug'

export type FieldZone = {
  centerPosition: {
    x: number
    y: number
  }
  id: number
}

export default class Game extends Phaser.Scene {
  private player!: GamePlayer
  public hoop!: Hoop
  public ball!: Ball
  public graphics!: Phaser.GameObjects.Graphics
  public fieldGrid!: FieldZone[][]
  public debug!: Debug

  constructor() {
    super('game')
  }

  create() {
    this.createField()
    this.setupWorldBounds()
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
    this.player = new GamePlayer(this)
    this.graphics = this.add.graphics()
    this.debug = new Debug(this)

    // Testing only - give ball to player
    this.ball.setPlayer(this.player.getSelectedCourtPlayer())
  }

  createField() {
    // Create a field grid
    let fieldZoneID: number = 0
    const numZoneColumns = Constants.GAME_WIDTH / Constants.FIELD_ZONE_WIDTH
    const numZoneRows = Constants.GAME_HEIGHT / Constants.FIELD_ZONE_HEIGHT
    this.fieldGrid = new Array(numZoneRows)
      .fill(0)
      .map(() => new Array(numZoneColumns).fill(undefined))

    for (let i = 0; i < this.fieldGrid.length; i++) {
      for (let j = 0; j < this.fieldGrid[0].length; j++) {
        this.fieldGrid[i][j] = {
          centerPosition: {
            x: j * Constants.FIELD_ZONE_WIDTH + Constants.FIELD_ZONE_WIDTH / 2,
            y: i * Constants.FIELD_ZONE_HEIGHT + Constants.FIELD_ZONE_HEIGHT / 2,
          },
          id: fieldZoneID++,
        }
      }
    }
  }

  getZoneForZoneId(zoneId: number) {
    for (let i = 0; i < this.fieldGrid.length; i++) {
      for (let j = 0; j < this.fieldGrid[0].length; j++) {
        if (this.fieldGrid[i][j].id === zoneId) {
          return this.fieldGrid[i][j]
        }
      }
    }
    return null
  }

  setupWorldBounds() {
    this.physics.world.setBounds(
      0,
      0,
      Constants.GAME_WIDTH,
      Constants.GAME_HEIGHT,
      true,
      true,
      false,
      false
    )
    this.physics.world.on('worldbounds', (obj) => {
      if (obj.gameObject.getData('ref') === this.ball) {
        this.scene.restart()
      }
    })
  }

  update() {
    this.player.update()
    this.ball.update()
  }
}
