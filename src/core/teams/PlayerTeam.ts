import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { CourtPlayer } from '../CourtPlayer'
import { Cursor } from '../Cursor'
import { Hoop } from '../Hoop'
import { PassCursor } from '../PassCursor'
import { ShotMeter } from '../ShotMeter'
import { SprintMeter } from '../SprintMeter'
import { PlayerStates, TeamStates } from '../states/StateTypes'
import { DriveDirection, Side, Team } from './Team'

export class PlayerTeam extends Team {
  private cursor: Cursor
  private passCursor: PassCursor
  private shotMeter: ShotMeter
  private sprintMeter: SprintMeter
  public selectedCourtPlayer: CourtPlayer | null = null
  public isSprinting: boolean = false

  constructor(game: Game) {
    super(game, {
      initialState: TeamStates.TIPOFF,
      side: Side.PLAYER,
      driveDirection: DriveDirection.LEFT,
    })
    this.handleBallInput()
    this.cursor = new Cursor(
      {
        color: 0x00ff00,
        position: { x: 0, y: 0 },
      },
      this.game
    )
    this.passCursor = new PassCursor(this.game)
    this.shotMeter = new ShotMeter(this, this.game)
    this.sprintMeter = new SprintMeter(this, this.game)
  }

  selectCourtPlayer(courtPlayer: CourtPlayer) {
    const oldPlayer = this.selectedCourtPlayer
    if (oldPlayer) {
      oldPlayer.setState(PlayerStates.WAIT)
    }
    this.selectedCourtPlayer = courtPlayer
    this.selectedCourtPlayer.setState(PlayerStates.PLAYER_CONTROL, courtPlayer.getCurrentState())
    this.cursor.selectCourtPlayer(courtPlayer)
  }

  getSelectedCourtPlayer() {
    return this.selectedCourtPlayer
  }

  handlePlayerMovement() {
    const keyboard = this.game.input.keyboard.createCursorKeys()
    const leftDown = keyboard.left.isDown
    const rightDown = keyboard.right.isDown
    const upDown = keyboard.up.isDown
    const downDown = keyboard.down.isDown

    const currentPlayer = this.selectedCourtPlayer
    if (!currentPlayer || currentPlayer.getCurrentState() == PlayerStates.WAIT) {
      return
    }
    const speed = this.sprintMeter.getSpeed()
    if (leftDown || rightDown) {
      let velocityX = leftDown ? -speed : speed
      if (leftDown && rightDown) {
        velocityX = 0
      }
      currentPlayer.setVelocityX(velocityX)
    } else {
      currentPlayer.setVelocityX(0)
    }
    if (upDown || downDown) {
      let velocityY = upDown ? -speed : speed
      if (upDown && downDown) {
        velocityY = 0
      }
      currentPlayer.setVelocityY(velocityY)
    } else {
      currentPlayer.setVelocityY(0)
    }
  }

  handleBallInput() {
    this.game.input.keyboard.on('keydown', (e) => {
      const selectedCourtPlayer = this.getSelectedCourtPlayer()
      if (!selectedCourtPlayer) {
        return
      }
      switch (e.code) {
        case 'Space': {
          if (this.canPassBall()) {
            const playerToPassTo = this.passCursor.getHighlightedCourtPlayer()
            if (playerToPassTo) {
              selectedCourtPlayer.passBall(playerToPassTo)
            }
          } else {
            this.switchPlayer()
          }
          break
        }
        case 'KeyQ': {
          const randomPlayer = this.courtPlayers.find((courtPlayer: CourtPlayer) => {
            return courtPlayer !== this.selectedCourtPlayer
          })
          if (randomPlayer) {
            randomPlayer.setState(PlayerStates.SET_SCREEN, this.selectedCourtPlayer)
          }
          break
        }
        default:
          const currentlySelectedPlayer = this.selectedCourtPlayer
          if (currentlySelectedPlayer) {
            currentlySelectedPlayer.clearColliders()
          }
      }
    })
  }

  switchPlayer() {
    const playerClosestToBall = Constants.getClosestPlayerToBall(this.game.ball, this.courtPlayers)
    this.selectCourtPlayer(playerClosestToBall)
  }

  canPassBall(): boolean {
    return this.selectedCourtPlayer !== null && this.getBall().getPossessionSide() == this.side
  }

  updatePassCursor() {
    if (!this.canPassBall()) {
      this.passCursor.setVisible(false)
    } else {
      this.passCursor.setVisible(true)
      const selectedCourtPlayer = this.getSelectedCourtPlayer()
      let playerToPassTo: any = null
      playerToPassTo = Constants.getClosestPlayer(selectedCourtPlayer!, this.courtPlayers)
      this.highlightPassPlayer(playerToPassTo)
      this.passCursor.follow()
    }
  }

  shoot(player: CourtPlayer, team: Team): void {
    return
  }

  setState(state: TeamStates, ...args: any[]) {
    // Pre-set state logic to select court player
    if (state === TeamStates.OFFENSE) {
      const player = this.getBall().getPlayer()
      if (player) {
        this.selectCourtPlayer(player)
      }
    } else if (state === TeamStates.DEFENSE) {
      const playerClosestToBall = Constants.getClosestPlayerToBall(
        this.game.ball,
        this.courtPlayers
      )
      if (playerClosestToBall) {
        this.selectCourtPlayer(playerClosestToBall)
      }
    } else if (state === TeamStates.INBOUND_BALL) {
      this.deselectPlayer()
    }
    super.setState(state, ...args)
  }

  updateSelectedPlayerCursor() {
    if (this.getCurrentState() == TeamStates.TIPOFF || !this.selectedCourtPlayer) {
      this.cursor.setVisible(false)
    } else {
      this.cursor.setVisible(true)
      this.cursor.follow()
    }
  }

  deselectPlayer() {
    const oldSelectedPlayer = this.selectedCourtPlayer
    if (oldSelectedPlayer) oldSelectedPlayer?.setState(PlayerStates.WAIT)
    this.selectedCourtPlayer = null
    this.cursor.setVisible(false)
  }

  highlightPassPlayer(courtPlayer: CourtPlayer) {
    this.passCursor.selectCourtPlayer(courtPlayer)
  }

  public getOpposingTeam(): Team {
    return this.game.cpuTeam
  }

  update() {
    super.update()
    this.updateSelectedPlayerCursor()
    this.updatePassCursor()
    this.handlePlayerMovement()
  }
}
