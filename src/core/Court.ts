import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Debug } from './Debug'
import { ShotType } from './meters/ShotMeter'
import { DriveDirection, Side } from './teams/Team'

export type FieldZone = {
  centerPosition: {
    x: number
    y: number
  }
  id: number
}

export class Court {
  private game: Game
  private courtImage!: Phaser.GameObjects.Image
  public graphics: Phaser.GameObjects.Graphics
  public debug: Debug
  public fieldGrid!: FieldZone[][]

  constructor(game: Game) {
    this.game = game
    this.graphics = this.game.add.graphics()
    this.setupBackground()
    this.createField()
    this.debug = new Debug(this, this.game)
  }

  setupBackground() {
    this.courtImage = this.game.add.image(
      Constants.COURT_WIDTH / 2,
      Constants.COURT_HEIGHT / 2,
      'court'
    )
    this.courtImage.displayWidth = Constants.COURT_WIDTH
    this.courtImage.displayHeight = Constants.GAME_HEIGHT
    this.game.cameras.main.setBackgroundColor(0xffffff)
    this.game.cameras.main.setBounds(0, 0, Constants.COURT_WIDTH, Constants.COURT_HEIGHT)
  }

  createField() {
    // Create a field grid
    let fieldZoneID: number = 0
    const numZoneColumns = Constants.COURT_WIDTH / Constants.FIELD_ZONE_WIDTH
    const numZoneRows = Constants.COURT_HEIGHT / Constants.FIELD_ZONE_HEIGHT
    this.fieldGrid = new Array(numZoneRows)
      .fill(0)
      .map(() => new Array(numZoneColumns).fill(undefined))

    for (let i = 0; i < this.fieldGrid.length; i++) {
      for (let j = 0; j < this.fieldGrid[0].length; j++) {
        this.fieldGrid[i][j] = {
          centerPosition: {
            x: j * Constants.FIELD_ZONE_WIDTH + Constants.FIELD_ZONE_WIDTH / 2,
            y: i * Constants.FIELD_ZONE_HEIGHT + Constants.FIELD_ZONE_HEIGHT / 2,
          },
          id: fieldZoneID++,
        }
      }
    }
  }

  static checkOutOfBounds(x: number, y: number) {
    const leftBorder = new Phaser.Geom.Line(0, Constants.COURT_HEIGHT - 100, 200, 150)
    const rightBorder = new Phaser.Geom.Line(
      Constants.COURT_WIDTH,
      Constants.COURT_HEIGHT - 100,
      Constants.COURT_WIDTH - 200,
      150
    )
    const getCrossProduct = (
      point1: { x: number; y: number },
      point2: { x: number; y: number },
      pointToCheck: { x: number; y: number }
    ) => {
      return (
        (point2.x - point1.x) * (pointToCheck.y - point1.y) -
        (point2.y - point1.y) * (pointToCheck.x - point1.x)
      )
    }
    const isOutOfBoundsVert =
      y > Constants.COURT_BOTTOM_SIDE_BORDER || y < Constants.COURT_TOP_SIDE_BORDER

    const isLeftOOB = getCrossProduct(leftBorder.getPointA(), leftBorder.getPointB(), { x, y }) < 0
    const isRightOOB =
      getCrossProduct(rightBorder.getPointA(), rightBorder.getPointB(), { x, y }) > 0

    const isOutOfBoundsHoriz = isLeftOOB || isRightOOB
    return isOutOfBoundsVert || isOutOfBoundsHoriz
  }

  getZoneForZoneId(zoneId: number) {
    for (let i = 0; i < this.fieldGrid.length; i++) {
      for (let j = 0; j < this.fieldGrid[0].length; j++) {
        if (this.fieldGrid[i][j].id === zoneId) {
          return this.fieldGrid[i][j]
        }
      }
    }
    return null
  }

  getNearestZoneForPosition(position: { x: number; y: number }) {
    let currMinDistance = Number.MAX_SAFE_INTEGER
    let closestZoneId = 0
    for (let i = 0; i < this.fieldGrid.length; i++) {
      for (let j = 0; j < this.fieldGrid[0].length; j++) {
        const zone = this.fieldGrid[i][j]
        const distanceToFieldGrid = Constants.getDistanceBetween(position, zone.centerPosition)
        if (distanceToFieldGrid < currMinDistance) {
          currMinDistance = distanceToFieldGrid
          closestZoneId = zone.id
        }
      }
    }
    return closestZoneId
  }
}
