import {GameController} from './GameController'
import {Body, Constraint} from 'matter-js'

export declare type ScaledSize = {
    WIDTH: number,
    width: number,
    HEIGHT: number,
    height: number,
    SCALE?: number,
    scale?: number,
}

export declare type TGameUpdateSubscriptionCallback = (dt: number, delta: number, fps: number) => any|Promise<any>
export declare type TGameRenderSubscriptionCallback = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, dt: number, delta: number, fps: number) => any|Promise<any>

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
