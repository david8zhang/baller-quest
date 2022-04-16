import { CourtPlayer } from '~/core/CourtPlayer'
import { DriveDirection, Team } from '~/core/teams/Team'
import Game from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { State } from '../../StateMachine'
import { PlayerStates } from '../../StateTypes'

export class DriveToBasketState extends State {
  public zoneToDriveToId: number = -1
  public timeStartedDriving: number = -1

  enter(player: CourtPlayer, team: Team) {
    const layupZones =
      team.driveDirection === DriveDirection.LEFT
        ? Constants.LAYUP_RANGE_RIGHT
        : Constants.LAYUP_RANGE_LEFT
    this.zoneToDriveToId = layupZones[Phaser.Math.Between(0, layupZones.length - 1)]
    const randomZone = Game.instance.court.getZoneForZoneId(this.zoneToDriveToId)
    if (randomZone) {
      player.setMoveTarget(randomZone.centerPosition)
    }
  }

  execute(player: CourtPlayer, team: Team) {
    const randomZone = Game.instance.court.getZoneForZoneId(this.zoneToDriveToId)
    if (randomZone) {
      if (Constants.IsAtPosition(player, randomZone.centerPosition)) {
        if (team.getBall().isInPossessionOf(player)) {
          team.shoot(player, team)
        } else {
          team.game.time.delayedCall(1000, () => {
            player.setState(PlayerStates.MOVE_TO_SPOT)
          })
        }
      } else {
        if (this.timeStartedDriving === -1) {
          this.timeStartedDriving = Date.now()
        } else {
          if (Date.now() - this.timeStartedDriving >= 5000) {
            this.timeStartedDriving = -1
            player.setState(PlayerStates.MOVE_TO_SPOT)
          }
        }
      }
    }
  }
}
