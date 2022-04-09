export enum PlayerStates {
  PLAYER_CONTROL = 'PlayerControl',
  MOVE_TO_SPOT = 'MoveToSpot',
  WAIT = 'Wait',
  DEFEND_MAN = 'DefendMan',
  INBOUND_BALL = 'InboundBall',
  RECEIVE_INBOUND = 'ReceiveInbound',
  CHASE_REBOUND = 'ChaseRebound',
  SHOOTING_BALL = 'ShootingBall',
  DRIVE_TO_BASKET = 'DriveToBasket',
}

export enum TeamStates {
  INBOUND_BALL = 'InboundBall',
  OFFENSE = 'Offense',
  DEFENSE = 'Defense',
  TIPOFF = 'TipOff',
}
