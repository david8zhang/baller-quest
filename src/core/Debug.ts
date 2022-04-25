import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Court } from './Court'

export class Debug {
  private game: Game
  private court: Court
  private objects: Phaser.GameObjects.Group
  public isVisible: boolean = false
  public alpha: number = 1
  public fishStates: Phaser.GameObjects.Text[] = []
  public bestPlayerSupportPositions: any[] = []
  public stateMappings: any = {}

  constructor(court: Court, game: Game) {
    this.court = court
    this.game = game
    this.objects = this.game.add.group()
    this.debugFieldGrid()
    this.handleDebugToggleInput()
  }

  handleDebugToggleInput() {
    this.game.input.keyboard.on('keydown', (e) => {
      switch (e.code) {
        case 'Backquote': {
          this.setVisible(!this.isVisible)
          break
        }
      }
    })
  }

  debugFieldGrid() {
    const fieldGrid = this.court.fieldGrid
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

  showBorders() {
    const leftBorder = new Phaser.Geom.Line(0, Constants.COURT_HEIGHT - 100, 200, 150)
    const rightBorder = new Phaser.Geom.Line(
      Constants.COURT_WIDTH,
      Constants.COURT_HEIGHT - 100,
      Constants.COURT_WIDTH - 200,
      150
    )
    const graphics = this.game.add.graphics()
    graphics.lineStyle(1, 0x00ff00)
    graphics.strokeLineShape(leftBorder)
    graphics.strokeLineShape(rightBorder)
  }

  setVisible(isVisible: boolean) {
    this.isVisible = isVisible
    this.objects.setVisible(isVisible)
    this.game.playerTeam.courtPlayers.forEach((p) => {
      p.setNameVisible(isVisible)
    })
    this.game.cpuTeam.courtPlayers.forEach((p) => {
      p.setNameVisible(isVisible)
    })
  }
}
