import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { Constants } from '~/utils/Constants'
import { State } from '../../StateMachine'
import { PlayerStates } from '../../StateTypes'

export class PassState extends State {
  enter(courtPlayer: CourtPlayer, team: Team) {
    const bestPassTarget = this.getBestPassTarget(courtPlayer, team)
    courtPlayer.passBall(bestPassTarget)
    courtPlayer.game.time.delayedCall(500, () => {
      courtPlayer.setState(PlayerStates.SMART_OFFENSE)
    })
  }

  calculatePassScore(thisPlayer: CourtPlayer, passTarget: CourtPlayer, team: Team) {
    let passScore = 0

    // Check how many players are in the passing lane
    const passingLane = new Phaser.Geom.Line(
      thisPlayer.sprite.x,
      thisPlayer.sprite.y,
      passTarget.sprite.x,
      passTarget.sprite.y
    )
    let numEnemyPlayersInLane = 0
    const opposingPlayers = team.getOpposingTeam().courtPlayers
    opposingPlayers.forEach((p: CourtPlayer) => {
      if (Phaser.Geom.Intersects.LineToRectangle(passingLane, p.markerRectangle)) {
        numEnemyPlayersInLane++
      }
    })
    passScore += 5 - numEnemyPlayersInLane

    // If the player has an open lane
    const hasOpenLane = Constants.getZoneToDriveTo(passTarget) !== -1
    passScore += hasOpenLane ? 3 : 0

    // If the player as an open shot
    const hasOpenShot = Constants.playerHasOpenShot(passTarget, passTarget.getDefender())
    passScore += hasOpenShot ? 5 : 0

    return passScore
  }

  getBestPassTarget(thisPlayer: CourtPlayer, team: Team) {
    const targets = team.courtPlayers.filter((player: CourtPlayer) => player !== thisPlayer)
    const sortByPassScore = targets.sort((a, b) => {
      return (
        this.calculatePassScore(thisPlayer, b, team) - this.calculatePassScore(thisPlayer, a, team)
      )
    })
    return sortByPassScore[0]
  }
}
