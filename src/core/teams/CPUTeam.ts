import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { CourtPlayer } from '../CourtPlayer'
import { ShotMeter } from '../ShotMeter'
import { TeamStates } from '../states/StateTypes'
import { DriveDirection, Side, Team } from './Team'

export class CPUTeam extends Team {
  constructor(game: Game) {
    super(game, {
      initialState: TeamStates.TIPOFF,
      side: Side.CPU,
      driveDirection: DriveDirection.RIGHT,
    })
  }

  getOpposingTeam(): Team {
    return this.game.playerTeam
  }

  shoot(courtPlayer: CourtPlayer, team: Team) {
    const openness = ShotMeter.getOpenness(courtPlayer, team)
    const shotType = ShotMeter.getShotType(
      {
        x: courtPlayer.sprite.x,
        y: courtPlayer.sprite.y,
      },
      team.driveDirection,
      team.game.court
    )
    const { percentage } = Constants.SHOT_PERCENTAGES[openness][shotType]
    const isSuccess = Constants.getSuccessBasedOnPercentage(percentage)
    this.game.time.delayedCall(200, () => {
      courtPlayer.shootBall(true, shotType)
    })
  }
}
