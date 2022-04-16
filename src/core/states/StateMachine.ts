export class StateMachine {
  private initialState: string
  private possibleStates: { [key: string]: State }
  private stateArgs: any[]
  private state: string

  constructor(
    initialState: string,
    possibleStates: { [key: string]: State },
    stateArgs: any[] = []
  ) {
    this.initialState = initialState
    this.possibleStates = possibleStates
    this.stateArgs = stateArgs
    this.state = ''

    Object.keys(this.possibleStates).forEach((key: string) => {
      this.possibleStates[key].stateMachine = this
    })
  }

  getInitialState() {
    return this.initialState
  }

  getState() {
    return this.state
  }

  getFullState() {
    return this.possibleStates[this.state]
  }

  step() {
    if (!this.state) {
      this.state = this.initialState
      this.possibleStates[this.state].enter(...this.stateArgs)
    }
    this.possibleStates[this.state].execute(...this.stateArgs)
  }

  transition(newState: string, ...enterArgs: any[]) {
    this.state = newState
    this.possibleStates[this.state].enter(...this.stateArgs, ...enterArgs)
  }
}

export class State {
  public stateMachine!: StateMachine
  enter(...args: any[]) {}
  execute(...args: any) {}
  exit(...args: any[]) {}
}
