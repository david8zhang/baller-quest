import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { CourtPlayer } from '../CourtPlayer'
import { Cursor } from '../Cursor'
import { PassCursor } from '../PassCursor'
import { PlayerStates, TeamStates } from '../states/StateTypes'
import { DriveDirection, Side, Team } from './Team'

export class PlayerTeam extends Team {
  private cursor: Cursor
  private passCursor: PassCursor

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
    this.selectCourtPlayer(this.courtPlayers[0])
  }

  selectCourtPlayer(courtPlayer: CourtPlayer) {
    const oldPlayer = this.selectedCourtPlayer
    if (oldPlayer) {
      oldPlayer.setState(PlayerStates.WAIT)
    }
    courtPlayer.setState(PlayerStates.PLAYER_CONTROL, courtPlayer.getCurrentState())
    super.selectCourtPlayer(courtPlayer)
    this.cursor.selectCourtPlayer(courtPlayer)
  }

  getSelectedCourtPlayer() {
    return this.selectedCourtPlayer
  }

  getHoop() {
    return this.game.playerHoop
  }

  handlePlayerMovement() {
    const keyboard = this.game.input.keyboard.createCursorKeys()
    const leftDown = keyboard.left.isDown
    const rightDown = keyboard.right.isDown
    const upDown = keyboard.up.isDown
    const downDown = keyboard.down.isDown

    const currentPlayer = this.selectedCourtPlayer
    if (currentPlayer.getCurrentState() == PlayerStates.WAIT) {
      return
    }

    const speed = Constants.COURT_PLAYER_SPEED
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
      switch (e.code) {
        case 'KeyE': {
          selectedCourtPlayer.shootBall()
          break
        }
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
      }
    })
  }

  switchPlayer() {
    const playerClosestToBall = Constants.getClosestPlayerToBall(this.game.ball, this.courtPlayers)
    this.selectCourtPlayer(playerClosestToBall)
  }

  canPassBall(): boolean {
    return this.getBall().getPossessionSide() == this.side
  }

  updatePassCursor() {
    if (!this.canPassBall()) {
      this.passCursor.setVisible(false)
    } else {
      this.passCursor.setVisible(true)
      const selectedCourtPlayer = this.getSelectedCourtPlayer()
      let playerToPassTo: any = null
      this.game.graphics.lineStyle(1, 0x00ff00)
      playerToPassTo = Constants.getClosestPlayer(selectedCourtPlayer, this.courtPlayers)
      this.highlightPassPlayer(playerToPassTo)
      this.passCursor.follow()
    }
  }

  updateSelectedPlayerCursor() {
    if (this.getCurrentState() == TeamStates.TIPOFF) {
      this.cursor.setVisible(false)
    } else {
      this.cursor.setVisible(true)
      this.cursor.follow()
    }
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