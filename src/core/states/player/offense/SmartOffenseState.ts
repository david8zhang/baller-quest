import { CourtPlayer } from '~/core/CourtPlayer'
import { Team } from '~/core/teams/Team'
import { Constants } from '~/utils/Constants'
import { State } from '../../StateMachine'
import { PlayerStates } from '../../StateTypes'

export class SmartOffenseState extends State {
  public tickHandler!: Phaser.Time.TimerEvent

  enter(thisPlayer: CourtPlayer, team: Team) {
    this.tickHandler = team.game.time.addEvent({
      delay: 1000,
      callback: () => {
        this.handleTick(thisPlayer, team)
      },
      repeat: -1,
    })
  }

  handleTick(thisPlayer: CourtPlayer, team: Team) {
    console.log('Handle tick!')
    const opposingTeam = team.getOpposingTeam()
    // if currently have the ball
    if (team.getBall().isInPossessionOf(thisPlayer)) {
      const shootFirst = Phaser.Math.Between(0, 1) === 0
      if (shootFirst) {
        const hasOpenShot = Constants.playerHasOpenShot(thisPlayer, thisPlayer.getDefender())
        if (hasOpenShot) {
          team.shoot(thisPlayer, team)
        } else {
          this.getRandomBehavior(thisPlayer, team)
        }
      } else {
        const hasOpenLane = Constants.playerHasOpenLane(
          thisPlayer,
          opposingTeam.getHoop(),
          opposingTeam.courtPlayers
        )
        if (hasOpenLane) {
          thisPlayer.setState(PlayerStates.DRIVE_TO_BASKET)
        } else {
          this.getRandomBehavior(thisPlayer, team)
        }
      }
    }
  }

  getRandomBehavior(thisPlayer: CourtPlayer, team: Team) {
    const randNum = Phaser.Math.Between(0, 2)
    if (randNum === 0) {
      this.passBehavior(thisPlayer, team)
    } else if (randNum === 1) {
      thisPlayer.setState(PlayerStates.DRIVE_TO_BASKET)
    }
  }

  passBehavior(thisPlayer: CourtPlayer, team: Team) {
    // If we have people to pass to, pass
    const passTargets = this.getPassTargets(thisPlayer, team)
    if (passTargets.length === 0) {
      thisPlayer.setState(PlayerStates.WAIT)
    } else {
      const bestPassTarget = this.getBestPassTarget(passTargets, team)
      thisPlayer.passBall(bestPassTarget, false)
    }
  }

  getBestPassTarget(targets: CourtPlayer[], team: Team) {
    const opposingHoop = team.getOpposingTeam().getHoop()
    const opposingPlayers = team.getOpposingTeam().courtPlayers
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]
      if (
        Constants.playerHasOpenLane(target, opposingHoop, opposingPlayers) ||
        Constants.playerHasOpenShot(target, target.getDefender())
      ) {
        return target
      }
    }
    const randomTarget = targets[Phaser.Math.Between(0, targets.length - 1)]
    return randomTarget
  }

  getPassTargets(player: CourtPlayer, team: Team) {
    const teamMates = team.courtPlayers.filter((p: CourtPlayer) => p !== player)
    return teamMates.filter((tm: CourtPlayer) => {
      const passLane = new Phaser.Geom.Line(
        player.sprite.x,
        player.sprite.y,
        tm.sprite.x,
        tm.sprite.y
      )
      return !this.enemyIsInPassingLane(passLane, team.getOpposingTeam().courtPlayers)
    })
  }

  enemyIsInPassingLane(line: Phaser.Geom.Line, opposingPlayers: CourtPlayer[]) {
    let isInPassingLane = false
    opposingPlayers.forEach((player: CourtPlayer) => {
      if (Phaser.Geom.Intersects.LineToRectangle(line, player)) {
        isInPassingLane = true
      }
    })
    return isInPassingLane
  }

  exit() {
    if (this.tickHandler) {
      this.tickHandler.paused = true
      this.tickHandler.destroy()
    }
  }
}
