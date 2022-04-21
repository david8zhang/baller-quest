import Game from '~/scenes/Game'
import { UI } from '~/scenes/UI'
import { Constants } from '~/utils/Constants'

export class ShotClock {
  private ui: UI
  private shotClockText!: Phaser.GameObjects.Text
  public secondsOnClock: number = 5
  public shotClockTickEvent: Phaser.Time.TimerEvent

  constructor(ui: UI) {
    this.ui = ui
    this.setupShotClockText()
    this.shotClockTickEvent = this.ui.time.addEvent({
      delay: 1000,
      callback: () => {
        this.secondsOnClock = Math.max(0, this.secondsOnClock - 1)
        if (this.secondsOnClock === 0) {
          Game.instance.onHandleShotClockExpiration()
        }
        this.updateShotClockText()
      },
      repeat: -1,
    })
    this.shotClockTickEvent.paused = true
  }

  stopClock() {
    this.shotClockTickEvent.paused = true
  }

  startClock() {
    this.shotClockTickEvent.paused = false
  }

  resetShotClock(numToResetTo: number = 5) {
    this.secondsOnClock = numToResetTo
    this.updateShotClockText()
  }

  setupShotClockText() {
    this.shotClockText = this.ui.add.text(0, 0, this.secondsOnClock.toString(), {
      fontSize: '15px',
      color: 'black',
    })
    this.shotClockText.setPosition(100, 100)
  }

  updateShotClockText() {
    this.shotClockText.setText(this.secondsOnClock.toString())
  }
}
