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
    if (thisPlayer.getCurrentState() !== PlayerStates.GO_TO_SPOT) {
      thisPlayer.setState(PlayerStates.GO_TO_SPOT)
    }

    // if (team.getBall().isInPossessionOf(thisPlayer)) {
    //   const shootFirst = Phaser.Math.Between(0, 1) === 0
    //   if (shootFirst) {
    //     const hasOpenShot = Constants.playerHasOpenShot(thisPlayer, thisPlayer.getDefender())
    //     if (hasOpenShot) {
    //       thisPlayer.setState(PlayerStates.SHOOT)
    //     } else {
    //       this.getRandomBehavior(thisPlayer, team)
    //     }
    //   } else {
    //     const zoneToDriveToId = Constants.getZoneToDriveTo(thisPlayer)
    //     if (zoneToDriveToId !== -1) {
    //       thisPlayer.setState(PlayerStates.DRIVE_TO_BASKET, zoneToDriveToId)
    //     } else {
    //       this.getRandomBehavior(thisPlayer, team)
    //     }
    //   }
    // }
  }

  getRandomBehavior(thisPlayer: CourtPlayer, team: Team) {
    const randNum = Phaser.Math.Between(0, 2)
    if (randNum === 0) {
      thisPlayer.setState(PlayerStates.PASS)
    } else if (randNum === 1) {
      thisPlayer.setState(PlayerStates.DRIVE_TO_BASKET)
    } else if (randNum === 2) {
      thisPlayer.setState(PlayerStates.SHOOT)
    }
  }

  exit() {
    if (this.tickHandler) {
      this.tickHandler.paused = true
      this.tickHandler.destroy()
    }
  }
}
