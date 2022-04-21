import { Score } from '~/core/Score'
import { ShotClock } from '~/core/ShotClock'

export class UI extends Phaser.Scene {
  public score!: Score
  private static _instance: UI
  public shotClock?: ShotClock

  constructor() {
    super('ui')
    UI._instance = this
  }

  static get instance() {
    return this._instance
  }

  create() {
    this.score = new Score(this)
    this.shotClock = new ShotClock(this)
  }
}
