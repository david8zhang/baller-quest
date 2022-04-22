import { BallState } from '~/core/Ball'
import { CourtPlayer } from '~/core/CourtPlayer'
import { ShotMeter } from '~/core/ShotMeter'
import { Constants } from '~/utils/Constants'
import { State } from '../../StateMachine'

export class ShootingState extends State {
  enter(courtPlayer: CourtPlayer) {
    const team = courtPlayer.team
    if (team.getBall().isInPossessionOf(courtPlayer)) {
      team.getBall().setBallState(BallState.WIND_UP_SHOT)
      courtPlayer.game.time.delayedCall(200, () => {
        const openness = ShotMeter.getOpenness(courtPlayer, team)
        const shotType = ShotMeter.getShotType(
          {
            x: courtPlayer.sprite.x,
            y: courtPlayer.sprite.y,
          },
          team.driveDirection,
          team.game.court
        )
        console.log('Shot openness: ', openness)
        console.log('Shot type: ', shotType)
        const { percentage } = Constants.SHOT_PERCENTAGES[openness][shotType]
        const isSuccess = Constants.getSuccessBasedOnPercentage(percentage)
        courtPlayer.shootBall(isSuccess, shotType)
      })
    }
  }
}
