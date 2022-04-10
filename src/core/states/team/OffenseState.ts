import { BallState } from '~/core/Ball'
import { CourtPlayer } from '~/core/CourtPlayer'
import { ShotMeter, ShotOpenness } from '~/core/ShotMeter'
import { Side, Team } from '~/core/teams/Team'
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
      if (distance <= reboundRadius) {
        player.setState(PlayerStates.CHASE_REBOUND)
      }
    })
  }

  setUpOffensiveFormation(team: Team) {
    team.courtPlayers.forEach((player) => {
      this.handlePlayerAction(player, team)
    })
  }

  handlePlayerAction(player: CourtPlayer, team: Team) {
    if (player.getCurrentState() === PlayerStates.PLAYER_CONTROL) {
      return
    }
    switch (player.getCurrentState()) {
      case PlayerStates.DRIVE_TO_BASKET:
      case PlayerStates.SET_SCREEN: {
        break
      }
      case PlayerStates.MOVE_TO_SPOT: {
        const offensiveFormation = team.getOffensiveFormation()
        const targetZoneId = offensiveFormation[player.role]
        const zone = team.game.court.getZoneForZoneId(targetZoneId)

        // If the player is at their designated zone
        if (zone && Constants.IsAtPosition(player, zone.centerPosition)) {
          // If this player currently has the ball
          if (team.getBall().isInPossessionOf(player)) {
            team.shoot(player, team)
            // if (this.hasOpenShot(player, team)) {
            //   team.shoot(player, team)
            // } else {
            //   const passTarget = this.getOpenPassTarget(player, team)
            //   if (!passTarget) {
            //     player.setState(PlayerStates.DRIVE_TO_BASKET)
            //   } else {
            //     team.game.time.delayedCall(250, () => {
            //       player.passBall(passTarget)
            //     })
            //   }
            // }
          }
        }
        break
      }
      default: {
        player.setState(PlayerStates.MOVE_TO_SPOT)
        break
      }
    }
  }

  getOpenPassTarget(courtPlayer: CourtPlayer, team: Team): CourtPlayer | null {
    let minPassDistance = Number.MAX_SAFE_INTEGER
    let passTarget: any = null
    const enemyPlayers = team.getOpposingTeam().courtPlayers
    team.courtPlayers.forEach((player: CourtPlayer) => {
      if (player !== courtPlayer) {
        if (!this.checkPlayerIntersects(courtPlayer, player, enemyPlayers)) {
          const distanceToPlayer = Constants.getDistanceBetween(
            {
              x: courtPlayer.sprite.x,
              y: courtPlayer.sprite.y,
            },
            {
              x: player.sprite.x,
              y: player.sprite.y,
            }
          )
          if (!passTarget) {
            passTarget = player
            minPassDistance = distanceToPlayer
          } else {
            if (distanceToPlayer < minPassDistance) {
              passTarget = player
              minPassDistance = distanceToPlayer
            }
          }
        }
      }
    })
    return passTarget
  }

  checkPlayerIntersects(src: CourtPlayer, target: CourtPlayer, playersToCheck: CourtPlayer[]) {
    const raySrcToTarget = new Phaser.Geom.Line(
      src.sprite.x,
      src.sprite.y,
      target.sprite.x,
      target.sprite.y
    )
    for (let i = 0; i < playersToCheck.length; i++) {
      const p = playersToCheck[i]
      if (Phaser.Geom.Intersects.LineToRectangle(raySrcToTarget, p.markerRectangle)) {
        return true
      }
    }
    return false
  }

  hasOpenShot(courtPlayer: CourtPlayer, team: Team): boolean {
    const shotOpenness = ShotMeter.getOpenness(courtPlayer, team)
    return shotOpenness === ShotOpenness.OPEN || shotOpenness === ShotOpenness.WIDE_OPEN
  }
}
