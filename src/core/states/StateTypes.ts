export enum PlayerStates {
  PLAYER_CONTROL = 'PlayerControl',
  WAIT = 'Wait',
  INBOUND_BALL = 'InboundBall',
  RECEIVE_INBOUND = 'ReceiveInbound',
  CHASE_REBOUND = 'ChaseRebound',
  SIDE_OUT_STATE = 'SideOutState',

  // Offensive States
  MOVE_TO_SPOT = 'MoveToSpot',
  DRIVE_TO_BASKET = 'DriveToBasket',
  SET_SCREEN = 'SetScreen',
  SMART_OFFENSE = 'SmartOffense',
  SHOOT = 'Shoot',
  PASS = 'Pass',
  GO_TO_SPOT = 'GoToSpot',

  // Defensive states
  DEFEND_MAN = 'DefendMan',
  DEFEND_BALL_HANDLER = 'DefendBallHandler',
  CUT_OFF_DRIVE_STATE = 'CutOffDriveState',
}

export enum TeamStates {
  SIDE_OUT_STATE = 'SideOut',
  INBOUND_BALL = 'InboundBall',
  OFFENSE = 'Offense',
  DEFENSE = 'Defense',
  TIPOFF = 'TipOff',
}
