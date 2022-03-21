import Game from '~/scenes/Game'
import { Cursor } from './Cursor'

export class PassCursor extends Cursor {
  constructor(game: Game) {
    super(
      {
        position: {
          x: 0,
          y: 0,
        },
        color: 0x0000ff,
        alpha: 0.5,
      },
      game
    )
  }

  getHighlightedCourtPlayer() {
    return this.selectedCourtPlayer
  }

  setVisible(isVisible: boolean) {
    this.highlight.setVisible(isVisible)
  }
}
