import Canvas, {CanvasRenderingContext2D} from 'react-native-canvas'
import {GameController} from './GameController'
import {ScaledSize} from 'react-native'
import {Body} from 'matter-js'

export declare type TGameUpdateSubscriptionCallback = (dt: number, delta: number, fps: number) => any|Promise<any>
export declare type TGameRenderSubscriptionCallback = (canvas: Canvas, ctx: CanvasRenderingContext2D, dt: number, delta: number, fps: number) => any|Promise<any>

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
    init(dimensions: ScaledSize, canvas: Canvas, ctx: CanvasRenderingContext2D): Promise<void>
    update?: TGameUpdateSubscriptionCallback,
    render?: TGameRenderSubscriptionCallback
}

export declare interface IGameScene {
    load(game: GameController): Promise<void>
}

export declare interface IBodiesIssuer {
    getDeclaredBodies(): Body[]
}
