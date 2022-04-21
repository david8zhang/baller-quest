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
import { Score } from '~/core/Score'
import { Court } from '~/core/Court'
import { UI } from './UI'
import { ShotType } from '~/core/ShotMeter'

export default class Game extends Phaser.Scene {
  public playerTeam!: PlayerTeam
  public cpuTeam!: CPUTeam
  private static _instance: Game

  // Court setup
  public leftHoop!: Hoop
  public rightHoop!: Hoop
  public ball!: Ball
  public score!: Score
  public court!: Court
  public isHandlingOutOfBounds: boolean = false

  public ignorePossessionChangeStates: string[] = [
    TeamStates.INBOUND_BALL,
    TeamStates.SIDE_OUT_STATE,
  ]

  constructor() {
    super('game')
    Game._instance = this
  }

  static get instance() {
    return this._instance
  }

  create() {
    this.court = new Court(this)
    this.ball = new Ball(this, {
      position: {
        x: Constants.COURT_WIDTH / 2,
        y: Constants.COURT_HEIGHT / 2,
      },
    })
    this.leftHoop = new Hoop(this, Constants.HOOP_LEFT)
    this.rightHoop = new Hoop(this, Constants.HOOP_RIGHT)

    this.playerTeam = new PlayerTeam(this)
    this.cpuTeam = new CPUTeam(this)

    this.cameras.main.startFollow(this.ball.sprite)

    // Register ball handlers
    this.ball.registerOnPlayerChangedHandler((oldPlayer: CourtPlayer, newPlayer: CourtPlayer) => {
      const isInbounding = () => {
        return (
          this.ignorePossessionChangeStates.includes(this.cpuTeam.getCurrentState()) ||
          this.ignorePossessionChangeStates.includes(this.playerTeam.getCurrentState())
        )
      }
      if (!isInbounding()) {
        const sideWithPosession = newPlayer.getSide()
        if (sideWithPosession == Side.PLAYER) {
          this.playerTeam.setState(TeamStates.OFFENSE)
          this.cpuTeam.setState(TeamStates.DEFENSE)
        } else {
          this.cpuTeam.setState(TeamStates.OFFENSE)
          this.playerTeam.setState(TeamStates.DEFENSE)
        }
        if (sideWithPosession !== newPlayer.getSide()) {
          if (UI.instance.shotClock) {
            UI.instance.shotClock.resetShotClock()
          }
        }
      }
    })

    this.ball.registerOnScoredHandler((scoredTeam: Team, shotType: ShotType) => {
      const opposingTeam = scoredTeam.getOpposingTeam()
      UI.instance.score.addPoints(scoredTeam.side, shotType === ShotType.THREE_POINTER ? 3 : 2)
      scoredTeam.setState(TeamStates.DEFENSE)
      opposingTeam.setState(TeamStates.INBOUND_BALL)
    })

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

  public onHandleShotClockExpiration() {
    const currentSideWithPossession = this.ball.getPossessionSide()
    const hoop =
      currentSideWithPossession === Side.CPU ? this.playerTeam.getHoop() : this.cpuTeam.getHoop()
    this.handleOutOfBounds(
      {
        x: hoop.sprite.x,
        y: hoop.sprite.y,
      },
      currentSideWithPossession
    )
  }

  get fieldGrid() {
    return this.court.fieldGrid
  }

  getZoneForZoneId(zoneId: number) {
    return this.court.getZoneForZoneId(zoneId)
  }

  handleOutOfBounds(outOfBoundsLocation: { x: number; y: number }, lastTouchedSide: Side) {
    if (!this.isHandlingOutOfBounds) {
      this.isHandlingOutOfBounds = true
      this.playerTeam.setState(
        TeamStates.SIDE_OUT_STATE,
        lastTouchedSide === Side.PLAYER,
        outOfBoundsLocation
      )
      this.cpuTeam.setState(
        TeamStates.SIDE_OUT_STATE,
        lastTouchedSide === Side.CPU,
        outOfBoundsLocation
      )
    }
  }

  depthSort() {
    const allCourtPlayers = this.playerTeam.courtPlayers.concat(this.cpuTeam.courtPlayers)
    const sortedByY = allCourtPlayers.sort((a, b) => {
      return a.sprite.y - b.sprite.y
    })
    let baseDepth = 1
    sortedByY.forEach((courtPlayer: CourtPlayer, index: number) => {
      courtPlayer.sprite.setDepth(baseDepth + index)
    })
  }

  update() {
    this.playerTeam.update()
    this.cpuTeam.update()
    this.ball.update()
    this.depthSort()
  }
}
