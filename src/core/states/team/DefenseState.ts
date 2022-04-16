import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { Constants } from '~/utils/Constants'
import { State } from '../StateMachine'
import { PlayerStates } from '../StateTypes'

export class DefenseState extends State {
  public didSwitchScreen: boolean = false

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
        player.setState(stateUpdate.state, ...args)
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
      return distanceToHoop <= 250
    }
    return false
  }

  getScreenSetter(team: Team): CourtPlayer | null {
    const opposingPlayers = team.getOpposingTeam().courtPlayers
    for (let i = 0; i < opposingPlayers.length; i++) {
      if (opposingPlayers[i].getCurrentState() === PlayerStates.SET_SCREEN) {
        return opposingPlayers[i]
      }
    }
    return null
  }

  getDefenderForPlayer(player: CourtPlayer, team: Team) {
    for (let i = 0; i < team.courtPlayers.length; i++) {
      const playerToDefend = team.courtPlayers[i].getPlayerToDefend()
      if (playerToDefend === player) {
        return team.courtPlayers[i]
      }
    }
    return null
  }

  getStateUpdates(team: Team): any {
    const hoop = team.getHoop()
    const ballHandler = team.getBall().getPlayer() as CourtPlayer
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
      playersWithinRange.slice(0, 3).forEach((player: CourtPlayer, index) => {
        playerStateMapping[player.role] = {
          state: PlayerStates.CUT_OFF_DRIVE_STATE,
          args: [index % 2 === 0 ? 0.5 + distFromMid : 0.5 - distFromMid],
        }
        distFromMid += 0.1
      })
    }

    // If a screen is being called, switch defender
    const screenSetter = this.getScreenSetter(team)
    if (screenSetter) {
      // Switch the screen defenders
      const screenSetterDefender = this.getDefenderForPlayer(screenSetter, team)
      if (screenSetterDefender) {
        playerStateMapping[screenSetterDefender.role] = {
          state: PlayerStates.DEFEND_BALL_HANDLER,
          args: [ballHandler],
        }
      }
    }
    return playerStateMapping
  }
}
