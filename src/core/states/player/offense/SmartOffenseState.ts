import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { Constants } from '~/utils/Constants'
import { State } from '../../StateMachine'
import { PlayerStates } from '../../StateTypes'

export class SmartOffenseState extends State {
  public tickHandler!: Phaser.Time.TimerEvent

  enter(thisPlayer: CourtPlayer, team: Team) {
    this.tickHandler = team.game.time.addEvent({
      delay: 1000,
      callback: () => {
        this.handleTick(thisPlayer, team)
      },
      repeat: -1,
    })
  }

  handleTick(thisPlayer: CourtPlayer, team: Team) {
    // if currently have the ball
    const randomOnBallBehaviors = [
      PlayerStates.DRIVE_TO_BASKET,
      PlayerStates.PASS,
      PlayerStates.SHOOT,
      PlayerStates.GO_TO_OPEN_SPOT,
    ]

    const randomOffBallBehaviors = [PlayerStates.GO_TO_OPEN_SPOT, PlayerStates.WAIT]

    if (team.getBall().isInPossessionOf(thisPlayer)) {
      const hasOpenShot = Constants.playerHasOpenShot(thisPlayer, thisPlayer.getDefender())
      if (hasOpenShot) {
        thisPlayer.setState(PlayerStates.SHOOT)
      } else {
        this.setRandomBehavior(thisPlayer, randomOnBallBehaviors)
      }
    } else {
      this.setRandomBehavior(thisPlayer, randomOffBallBehaviors)
    }
  }

  setRandomBehavior(thisPlayer: CourtPlayer, behaviors: PlayerStates[]) {
    const randBehavior = behaviors[Phaser.Math.Between(0, behaviors.length - 1)]
    thisPlayer.setState(randBehavior)
  }

  exit() {
    if (this.tickHandler) {
      this.tickHandler.paused = true
      this.tickHandler.destroy()
    }
  }
}
