import {GestureResponderEvent} from 'react-native'
import {TInputState, TScaledSize} from './GameTypes'
import {Screen} from './Screen'

export class InputController {
    private static _instance?: InputController

    private constructor() {
    }

    public static create(): InputController {
        if (!InputController._instance) {
            InputController._instance = new InputController()
        }
        return InputController._instance
    }

    protected readonly TOUCH_TIMEOUT_MAX = 500

    protected _dimensions: TScaledSize = Screen.get()
    protected readonly _middleX = this._dimensions.width / 2
    protected readonly _debugButtonBoundaries = {topLeft: {x: 0, y: 0}, bottomRight: {x: 50, y: 50}}

    protected _state: TInputState = {
        leftSideTrigger: false,
        rightSideTrigger: false,
        debugTrigger: false,
    }

    public get state(): TInputState {
        return this._state
    }

    public onTouchStart({nativeEvent}: GestureResponderEvent) {
        this._state.lastStart = {
            x: nativeEvent.locationX,
            y: nativeEvent.locationY,
            timestamp: nativeEvent.timestamp,
        }

        this._state.fingerCurrPos = {
            x: nativeEvent.locationX,
            y: nativeEvent.locationY,
        }

        this._state.timestamp = nativeEvent.timestamp

        this._sideTrigger(nativeEvent.locationX, nativeEvent.locationY, true)
    }

    public onTouchMove({nativeEvent}: GestureResponderEvent) {
        this._state.fingerCurrPos = {
            x: nativeEvent.locationX,
            y: nativeEvent.locationY,
        }

        this._state.timestamp = nativeEvent.timestamp

        this._sideTrigger(nativeEvent.locationX, nativeEvent.locationY, true)
    }

    public onTouchEnd({nativeEvent}: GestureResponderEvent) {
        this._state.fingerCurrPos = {
            x: nativeEvent.locationX,
            y: nativeEvent.locationY,
        }

        this._state.timestamp = nativeEvent.timestamp

        if(this._state.lastStart) {
            if(
                nativeEvent.locationX === this._state.lastStart.x
                && nativeEvent.locationY === this._state.lastStart.y
                && nativeEvent.timestamp - this._state.lastStart.timestamp <= this.TOUCH_TIMEOUT_MAX) {

                this._pressTrigger(nativeEvent.locationX, nativeEvent.locationY)
            }
        }

        this._sideTrigger(nativeEvent.locationX, nativeEvent.locationY, false)
    }

    protected _sideTrigger(x: number, y: number, pressed: boolean) {
        if (pressed && x < this._middleX && !this._fingerInDebugButtonArea(x, y)) {
            this._state.leftSideTrigger = true
            this._state.rightSideTrigger = false
            return
        } else if (pressed && x >= this._middleX && !this._fingerInDebugButtonArea(x, y)) {
            this._state.leftSideTrigger = false
            this._state.rightSideTrigger = true
            return
        }

        this._state.leftSideTrigger = false
        this._state.rightSideTrigger = false
    }

    protected _pressTrigger(x: number, y: number) {
        if(this._fingerInDebugButtonArea(x,y)) {
            this._state.debugTrigger = !this._state.debugTrigger
        }
    }

    protected _fingerInDebugButtonArea(x: number, y: number): boolean {
        return (
            x > this._debugButtonBoundaries.topLeft.x
            && x < this._debugButtonBoundaries.bottomRight.x
            && y > this._debugButtonBoundaries.topLeft.y
            && y < this._debugButtonBoundaries.bottomRight.y
        )
    }
}
