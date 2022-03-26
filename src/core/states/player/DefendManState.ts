import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { State } from '../StateMachine'

export class DefendManState extends State {
  execute(player: CourtPlayer, team: Team) {}
}
