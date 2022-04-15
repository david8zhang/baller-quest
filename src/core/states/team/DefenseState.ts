import { BallState } from '~/core/Ball'
import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { Constants } from '~/utils/Constants'
import { State } from '../StateMachine'
import { PlayerStates } from '../StateTypes'

export class DefenseState extends State {
  enter(team: Team) {
    team.courtPlayers.forEach((player: CourtPlayer) => {
      if (team.getCurrentState() !== PlayerStates.PLAYER_CONTROL) {
        player.setState(PlayerStates.DEFEND_MAN)
      }
    })
  }

  execute(team: Team) {
    // apply new states based on changes on the court
    const stateUpdates = this.getStateUpdates(team)
    team.courtPlayers.forEach((player: CourtPlayer) => {
      if (stateUpdates[player.role]) {
        const stateUpdate = stateUpdates[player.role]
        const args = stateUpdate.args ? stateUpdate.args : []
        player.setState(stateUpdate.state, args)
      }
    })
  }

  ballHandlerInLane(team: Team) {
    const playerWithBall = team.getBall().getPlayer()
    const hoop = team.getHoop()
    if (playerWithBall) {
      const distanceToHoop = Constants.getDistanceBetween(
        {
          x: playerWithBall.sprite.x,
          y: playerWithBall.sprite.y,
        },
        {
          x: hoop.sprite.x,
          y: hoop.sprite.y,
        }
      )
      return distanceToHoop <= 200
    }
    return false
  }

  getStateUpdates(team: Team): any {
    const hoop = team.getHoop()
    const ballHandler = team.getBall().getPlayer()
    const opposingPlayers = team.getOpposingTeam().courtPlayers
    const playerStateMapping = {}
    team.courtPlayers.forEach((player: CourtPlayer) => {
      playerStateMapping[player.role] = {
        state: PlayerStates.DEFEND_MAN,
      }
    })

    // If the ball handler is driving to the hoop, cut him off with players closest to the hoop
    if (ballHandler && this.ballHandlerInLane(team)) {
      const playersWithinRange = team.courtPlayers.sort((a: CourtPlayer, b: CourtPlayer) => {
        const getDistToBallHandler = (p) =>
          Constants.getDistanceBetween(
            {
              x: p.sprite.x,
              y: p.sprite.y,
            },
            {
              x: ballHandler.sprite.x,
              y: ballHandler.sprite.y,
            }
          )
        return getDistToBallHandler(a) - getDistToBallHandler(b)
      })

      let distFromMid = 0
      playersWithinRange.forEach((player: CourtPlayer, index) => {
        playerStateMapping[player.role] = {
          state: PlayerStates.CUT_OFF_DRIVE_STATE,
          args: [index % 2 === 0 ? 0.5 + distFromMid : 0.5 - distFromMid],
        }
        distFromMid += 0.1
      })
    }
    return playerStateMapping
  }
}
