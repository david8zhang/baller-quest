import { BallState } from '~/core/Ball'
import { CourtPlayer } from '~/core/CourtPlayer'
import { ShotMeter, ShotOpenness } from '~/core/meters/ShotMeter'
import { Side, Team } from '~/core/teams/Team'
import { Constants } from '~/utils/Constants'
import { State } from '../StateMachine'
import { PlayerStates } from '../StateTypes'

export class OffenseState extends State {
  enter(team: Team) {
    team.courtPlayers.forEach((player: CourtPlayer) => {
      if (player.getCurrentState() !== PlayerStates.PLAYER_CONTROL) {
        player.setState(PlayerStates.MOVE_TO_SPOT)
      }
    })
  }

  execute(team: Team) {
    const ball = team.getBall()
    if (
      (ball.currState === BallState.REBOUND || ball.currState === BallState.LOOSE) &&
      !ball.isOutOfBounds()
    ) {
      this.chaseRebound(team)
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
      if (distance <= reboundRadius) {
        player.setState(PlayerStates.CHASE_REBOUND)
      }
    })
  }
}
