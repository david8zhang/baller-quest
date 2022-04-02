import { BallState } from '~/core/Ball'
import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { Constants } from '~/utils/Constants'
import { State } from '../StateMachine'
import { PlayerStates } from '../StateTypes'

export class OffenseState extends State {
  execute(team: Team) {
    const ball = team.getBall()
    if (ball.currState === BallState.LOOSE) {
      this.chaseRebound(team)
    } else {
      this.setUpOffensiveFormation(team)
    }
  }

  chaseRebound(team: Team) {
    const reboundRadius = 375
    const ball = team.getBall()
    team.courtPlayers.forEach((player: CourtPlayer) => {
      const distance = Constants.getDistanceBetween(
        {
          x: player.sprite.x,
          y: player.sprite.y,
        },
        {
          x: ball.sprite.x,
          y: ball.sprite.y,
        }
      )
      console.log(distance)
      if (distance <= reboundRadius) {
        player.setState(PlayerStates.CHASE_REBOUND)
      }
    })
  }

  setUpOffensiveFormation(team: Team) {
    team.courtPlayers.forEach((player) => {
      if (player.getCurrentState() !== PlayerStates.PLAYER_CONTROL) {
        player.setState(PlayerStates.MOVE_TO_SPOT)
      }
    })
  }
}
