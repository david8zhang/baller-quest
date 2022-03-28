import Phaser from 'phaser'
import { Ball } from '~/core/Ball'
import { Hoop } from '~/core/Hoop'
import { PlayerTeam } from '~/core/teams/PlayerTeam'
import { CPUTeam } from '~/core/teams/CPUTeam'
import { Constants } from '~/utils/Constants'
import { Debug } from '~/core/Debug'
import { CourtPlayer } from '~/core/CourtPlayer'
import { Side, Team } from '~/core/teams/Team'
import { TeamStates } from '~/core/states/StateTypes'

export type FieldZone = {
  centerPosition: {
    x: number
    y: number
  }
  id: number
}

export default class Game extends Phaser.Scene {
  public playerTeam!: PlayerTeam
  public cpuTeam!: CPUTeam

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
        x: Constants.COURT_WIDTH / 2,
        y: Constants.COURT_HEIGHT / 2,
      },
    })
    this.playerHoop = new Hoop(this, Constants.PLAYER_HOOP_CONFIG)
    this.cpuHoop = new Hoop(this, Constants.CPU_HOOP_CONFIG)

    this.playerTeam = new PlayerTeam(this)
    this.cpuTeam = new CPUTeam(this)
    this.graphics = this.add.graphics()
    this.debug = new Debug(this)

    this.cameras.main.startFollow(this.ball.sprite)

    // Register ball handlers
    this.ball.registerOnPlayerChangedHandler((oldPlayer: CourtPlayer, newPlayer: CourtPlayer) => {
      if (!oldPlayer && this.cpuTeam.getCurrentState() !== TeamStates.INBOUND_BALL) {
        const sideWithPosession = newPlayer.getSide()
        if (sideWithPosession == Side.PLAYER) {
          this.playerTeam.setState(TeamStates.OFFENSE)
          this.cpuTeam.setState(TeamStates.DEFENSE)
        } else {
          this.cpuTeam.setState(TeamStates.OFFENSE)
          this.playerTeam.setState(TeamStates.DEFENSE)
        }
      }
    })

    this.ball.registerOnScoredHandler((scoredTeam: Team) => {
      const opposingTeam = scoredTeam.getOpposingTeam()
      scoredTeam.setState(TeamStates.DEFENSE)
      opposingTeam.setState(TeamStates.INBOUND_BALL)
    })

    // Add colliders between opposing team's players
    // this.physics.add.collider(this.playerTeam.courtPlayerGroup, this.cpuTeam.courtPlayerGroup)

    this.tipOff()
  }

  tipOff() {
    const zoneToTipTo = this.getZoneForZoneId(Constants.TIPOFF_LEFT)
    // const zoneToTipTo =
    //   Phaser.Math.Between(0, 1) === 0
    //     ? this.getZoneForZoneId(Constants.TIPOFF_RIGHT)
    //     : this.getZoneForZoneId(Constants.TIPOFF_LEFT)
    if (zoneToTipTo) {
      this.ball.tipOff(zoneToTipTo)
    }
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
    this.playerTeam.update()
    this.cpuTeam.update()
    this.ball.update()
  }
}
