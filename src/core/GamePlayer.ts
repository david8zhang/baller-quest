import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { CourtPlayer, Side } from './CourtPlayer'

export class GamePlayer {
  private game: Game
  private courtPlayers: CourtPlayer[] = []
  private selectedPlayerIndex: number = 0

  constructor(game: Game) {
    this.game = game
    this.initCourtPlayers()
    this.handleBallInput()
  }

  initCourtPlayers() {
    const newPlayer = new CourtPlayer(this.game, {
      position: { x: Constants.GAME_WIDTH / 2, y: Constants.GAME_HEIGHT / 2 },
      side: Side.PLAYER,
    })
    this.game.ball.setPlayer(newPlayer)
    this.courtPlayers.push(newPlayer)
    const group = new Phaser.GameObjects.Group(this.game)
    group.add(newPlayer.sprite)
    this.game.physics.add.overlap(group, this.game.ball.sprite, (obj1, obj2) => {
      const collidedPlayer = obj1.getData('ref') as CourtPlayer
      this.game.ball.setPlayer(collidedPlayer)
    })
  }

  handlePlayerMovement() {
    const keyboard = this.game.input.keyboard.createCursorKeys()
    const leftDown = keyboard.left.isDown
    const rightDown = keyboard.right.isDown
    const upDown = keyboard.up.isDown
    const downDown = keyboard.down.isDown

    const currentPlayer = this.courtPlayers[this.selectedPlayerIndex]
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
    this.handlePlayerMovement()
  }
}
