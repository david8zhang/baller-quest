import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'

export class Debug {
  private game: Game
  private objects: Phaser.GameObjects.Group
  public isVisible: boolean = false
  public alpha: number = 0.5
  public fishStates: Phaser.GameObjects.Text[] = []
  public bestPlayerSupportPositions: any[] = []

  constructor(game: Game) {
    this.game = game
    this.objects = this.game.add.group()
    this.debugFieldGrid()
  }

  debugFieldGrid() {
    const fieldGrid = this.game.fieldGrid
    for (let i = 0; i < fieldGrid.length; i++) {
      for (let j = 0; j < fieldGrid[0].length; j++) {
        const { centerPosition, id } = fieldGrid[i][j]
        const zoneRect = this.game.add
          .rectangle(
            centerPosition.x,
            centerPosition.y,
            Constants.FIELD_ZONE_WIDTH,
            Constants.FIELD_ZONE_HEIGHT,
            0x000000,
            0
          )
          .setStrokeStyle(5, 0x00ff00, this.alpha)
          .setVisible(this.isVisible)
        const text = this.game.add
          .text(centerPosition.x, centerPosition.y, id.toString())
          .setAlpha(this.alpha)
        this.objects.add(zoneRect)
        this.objects.add(text)
      }
    }
  }

  setVisible(isVisible: boolean) {
    this.isVisible = isVisible
    this.objects.setVisible(isVisible)
  }
}
