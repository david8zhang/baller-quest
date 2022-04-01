import { Scene } from 'phaser'
import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from './teams/Team'

export class Score {
  private game: Scene
  public playerScore: number = 0
  public cpuScore: number = 0
  public playerScoreText: Phaser.GameObjects.Text
  public cpuScoreText: Phaser.GameObjects.Text
  constructor(game: Scene) {
    this.game = game
    this.playerScoreText = this.game.add.text(0, 0, 'Player: 0')
    this.playerScoreText.setPosition(
      Constants.GAME_WIDTH - this.playerScoreText.displayWidth - 20,
      Constants.GAME_HEIGHT - 100
    )
    this.cpuScoreText = this.game.add.text(0, 0, 'CPU: 0')
    this.cpuScoreText.setPosition(
      Constants.GAME_WIDTH - this.cpuScoreText.displayWidth - 20,
      Constants.GAME_HEIGHT - 50
    )
  }

  public addPoints(side: Side, numPoints: number) {
    if (side == Side.CPU) {
      this.cpuScore += numPoints
      this.cpuScoreText.setText(`CPU: ${this.cpuScore}`)
      this.cpuScoreText.setPosition(
        Constants.GAME_WIDTH - this.cpuScoreText.displayWidth - 20,
        Constants.GAME_HEIGHT - 50
      )
    }
    if (side == Side.PLAYER) {
      this.playerScore += numPoints
      this.playerScoreText.setText(`Player: ${this.playerScore}`)
      this.playerScoreText.setPosition(
        Constants.GAME_WIDTH - this.playerScoreText.displayWidth - 20,
        Constants.GAME_HEIGHT - 100
      )
    }
  }
}
