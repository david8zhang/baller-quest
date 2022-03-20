import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { CourtPlayer, Side } from './CourtPlayer'
import { Cursor } from './Cursor'
import { TeamStates } from './states/StateTypes'
import { Team } from './Team'

export class GamePlayer extends Team {
  private cursor: Cursor
  private selectedCourtPlayerIndex = 0
  constructor(game: Game) {
    super(game, TeamStates.OFFENSE, Side.PLAYER)
    this.handleBallInput()
    this.cursor = new Cursor({ x: 0, y: 0 }, this.game)
    this.selectCourtPlayer(this.courtPlayers[this.selectedCourtPlayerIndex])
  }

  selectCourtPlayer(courtPlayer: CourtPlayer) {
    this.cursor.selectCourtPlayer(courtPlayer)
  }

  getSelectedCourtPlayer() {
    return this.courtPlayers[this.selectedCourtPlayerIndex]
  }

  handlePlayerMovement() {
    const keyboard = this.game.input.keyboard.createCursorKeys()
    const leftDown = keyboard.left.isDown
    const rightDown = keyboard.right.isDown
    const upDown = keyboard.up.isDown
    const downDown = keyboard.down.isDown

    const currentPlayer = this.courtPlayers[this.selectedCourtPlayerIndex]
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
        case 'Space': {
          this.game.ball.shoot()
          break
        }
        case 'Backquote': {
          this.game.debug.setVisible(!this.game.debug.isVisible)
          break
        }
      }
    })
  }

  update() {
    super.update()
    this.cursor.follow()
    this.handlePlayerMovement()
  }
}
