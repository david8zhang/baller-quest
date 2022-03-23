import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'

export class Debug {
  private game: Game
  private objects: Phaser.GameObjects.Group
  public isVisible: boolean = false
  public alpha: number = 1
  public fishStates: Phaser.GameObjects.Text[] = []
  public bestPlayerSupportPositions: any[] = []

  constructor(game: Game) {
    this.game = game
    this.objects = this.game.add.group()
    this.debugFieldGrid()
    this.handleDebugToggleInput()
  }

  handleDebugToggleInput() {
    this.game.input.keyboard.on('keydown', (e) => {
      switch (e.code) {
        case 'Backquote': {
          this.game.debug.setVisible(!this.game.debug.isVisible)
          break
        }
      }
    })
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
          .setTintFill(0x00ff00)
          .setAlpha(this.alpha)
          .setVisible(this.isVisible)
        text.setPosition(
          centerPosition.x - text.displayWidth / 2,
          centerPosition.y - text.displayHeight / 2
        )
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
