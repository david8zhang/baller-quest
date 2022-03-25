import Phaser from 'phaser'
import { Ball } from '~/core/Ball'
import { Hoop } from '~/core/Hoop'
import { GamePlayer } from '~/core/GamePlayer'
import { Constants } from '~/utils/Constants'
import { Debug } from '~/core/Debug'
import { CPU } from '~/core/CPU'
import { CourtPlayer } from '~/core/CourtPlayer'

export type FieldZone = {
  centerPosition: {
    x: number
    y: number
  }
  id: number
}

export default class Game extends Phaser.Scene {
  private player!: GamePlayer
  private cpu!: CPU

  // Court setup
  public playerHoop!: Hoop
  public cpuHoop!: Hoop
  public ball!: Ball

  // Grid for player positioning
  public graphics!: Phaser.GameObjects.Graphics
  public fieldGrid!: FieldZone[][]

  public debug!: Debug
  public bgImage!: Phaser.GameObjects.Image

  constructor() {
    super('game')
  }

  create() {
    this.createField()
    this.setupBackground()
    this.setupWorldBounds()

    this.ball = new Ball(this, {
      position: {
        x: Constants.GAME_WIDTH / 2,
        y: Constants.GAME_HEIGHT / 2,
      },
    })
    this.playerHoop = new Hoop(this, Constants.PLAYER_HOOP_CONFIG)
    this.cpuHoop = new Hoop(this, Constants.CPU_HOOP_CONFIG)

    this.player = new GamePlayer(this)
    this.cpu = new CPU(this)
    this.graphics = this.add.graphics()
    this.debug = new Debug(this)

    // Testing only - give ball to player
    this.ball.setPlayer(this.player.getSelectedCourtPlayer())
    this.cameras.main.startFollow(this.ball.sprite)
  }

  createField() {
    // Create a field grid
    let fieldZoneID: number = 0
    const numZoneColumns = Constants.COURT_WIDTH / Constants.FIELD_ZONE_WIDTH
    const numZoneRows = Constants.COURT_HEIGHT / Constants.FIELD_ZONE_HEIGHT
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
      this.bgImage.displayWidth,
      this.bgImage.displayHeight,
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

  setupBackground() {
    this.bgImage = this.add.image(Constants.COURT_WIDTH / 2, Constants.COURT_HEIGHT / 2, 'court')
    this.bgImage.displayWidth = Constants.GAME_WIDTH * 1.5
    this.bgImage.displayHeight = Constants.GAME_HEIGHT
    this.cameras.main.setBackgroundColor(0xffffff)
    this.cameras.main.setBounds(0, 0, Constants.COURT_WIDTH, Constants.COURT_HEIGHT)
  }

  update() {
    this.player.update()
    this.ball.update()
  }

  public focusCamera(player: CourtPlayer) {}
}
