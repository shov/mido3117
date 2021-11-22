import Canvas, {CanvasRenderingContext2D} from 'react-native-canvas'
import {GameController} from './GameController'
import {ScaledSize} from 'react-native'
import {Body, Constraint} from 'matter-js'

export declare type TGameUpdateSubscriptionCallback = (dt: number, input: TInputState, delta: number, fps: number) => any|Promise<any>
export declare type TGameRenderSubscriptionCallback = (canvas: Canvas, ctx: CanvasRenderingContext2D, dt: number, input: TInputState, delta: number, fps: number) => any|Promise<any>

export declare type TUpdateSubscriptionsBatch = {
    pre: TGameUpdateSubscriptionCallback[],
    default: TGameUpdateSubscriptionCallback[],
    post: TGameUpdateSubscriptionCallback[],
}

export declare type TRenderSubscriptionsBatch = {
    pre: TGameRenderSubscriptionCallback[],
    default: TGameRenderSubscriptionCallback[],
    post: TGameRenderSubscriptionCallback[],
}

export declare interface IEntity {
    init(...args: any[]): Promise<void>,
    update?: TGameUpdateSubscriptionCallback,
    render?: TGameRenderSubscriptionCallback
}

export declare interface IGameScene {
    load(game: GameController): Promise<void>
}

export declare interface IBodiesIssuer {
    getDeclaredBodies(): Body[]
}

export declare interface IConstraintsIssuer {
    getDeclaredConstraints(): Constraint[]
}

export declare type TInputState = {
    timestamp?: number,
    leftSideTrigger: boolean,
    rightSideTrigger: boolean,
    fingerCurrPos?: { x: number, y: number },
    debugTrigger: boolean,
    lastStart?: {
        x: number, y: number, timestamp: number,
    }
}

export declare type TStaticShape = {
    kind?: string,
    x: number,
    y: number,
    w?: number,
    h?: number,
    r?: number,
    angle: number,
    vertices: {x: number, y: number}[],
    color?: string,
    fillColor?: string,
}
