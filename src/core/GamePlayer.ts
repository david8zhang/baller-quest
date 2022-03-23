import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { CourtPlayer, Side } from './CourtPlayer'
import { Cursor } from './Cursor'
import { PassCursor } from './PassCursor'
import { TeamStates } from './states/StateTypes'
import { Team } from './Team'

export class GamePlayer extends Team {
  private cursor: Cursor
  private passCursor: PassCursor
  constructor(game: Game) {
    super(game, TeamStates.OFFENSE, Side.PLAYER)
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
    super.selectCourtPlayer(courtPlayer)
    this.cursor.selectCourtPlayer(courtPlayer)
    this.game.focusCamera(courtPlayer)
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
      switch (e.code) {
        case 'KeyE': {
          this.game.ball.shoot(this.game.playerHoop)
          break
        }
        case 'Space': {
          if (this.canPassBall()) {
            this.passBall()
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

  passBall() {
    const playerToPassTo = this.passCursor.getHighlightedCourtPlayer()
    if (playerToPassTo) {
      this.getBall().passTo(playerToPassTo)
    }
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

  highlightPassPlayer(courtPlayer: CourtPlayer) {
    this.passCursor.selectCourtPlayer(courtPlayer)
  }

  update() {
    super.update()
    this.cursor.follow()
    this.updatePassCursor()
    this.handlePlayerMovement()
  }
}
