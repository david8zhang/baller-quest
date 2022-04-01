import { Score } from '~/core/Score'

export class UI extends Phaser.Scene {
  public score!: Score
  private static _instance: UI

  constructor() {
    super('ui')
    UI._instance = this
  }

  static get instance() {
    return this._instance
  }

  create() {
    this.score = new Score(this)
  }
}
