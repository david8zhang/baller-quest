import { CourtPlayer } from '~/core/CourtPlayer'
import { DriveDirection, Team } from '~/core/teams/Team'
import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { State } from '../../StateMachine'
import { PlayerStates } from '../../StateTypes'

export class DriveToBasketState extends State {
  public zoneToDriveToId: number = -1
  public timeStartedDriving: number = -1

  enter(player: CourtPlayer, team: Team, zoneToDriveToId?: number) {
    player.speed = Constants.COURT_PLAYER_SPRINT_SPEED
    player.game.time.delayedCall(200, () => {
      player.speed = Constants.COURT_PLAYER_TIRED_SPEED
    })
    if (!zoneToDriveToId || zoneToDriveToId === -1) {
      const layupZones =
        team.driveDirection === DriveDirection.LEFT
          ? Constants.LAYUP_RANGE_RIGHT
          : Constants.LAYUP_RANGE_LEFT
      this.zoneToDriveToId = layupZones[Phaser.Math.Between(0, layupZones.length - 1)]
    } else {
      this.zoneToDriveToId = zoneToDriveToId
    }
    const zoneToDriveTo = Game.instance.court.getZoneForZoneId(this.zoneToDriveToId)
    if (zoneToDriveTo) {
      player.setMoveTarget(zoneToDriveTo.centerPosition)
    }
  }

  execute(player: CourtPlayer, team: Team) {
    const randomZone = Game.instance.court.getZoneForZoneId(this.zoneToDriveToId)
    if (randomZone) {
      if (Constants.IsAtPosition(player, randomZone.centerPosition, 15)) {
        if (team.getBall().isInPossessionOf(player)) {
          player.setState(PlayerStates.SHOOT)
        } else {
          team.game.time.delayedCall(1000, () => {
            player.setState(PlayerStates.MOVE_TO_SPOT)
          })
        }
      } else {
        if (this.timeStartedDriving === -1) {
          this.timeStartedDriving = Date.now()
        } else {
          if (Date.now() - this.timeStartedDriving >= 3500) {
            this.timeStartedDriving = -1
            player.setState(PlayerStates.MOVE_TO_SPOT)
          }
        }
      }
    }
  }
}
