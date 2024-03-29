import Canvas, {CanvasRenderingContext2D} from 'react-native-canvas'
import {Engine} from 'matter-js'
import {
    IEntity,
    IGameScene,
    TGameRenderSubscriptionCallback,
    TGameUpdateSubscriptionCallback, TInputState,
    TRenderSubscriptionsBatch, TScaledSize,
    TUpdateSubscriptionsBatch
} from './GameTypes'
import {InputController} from './InputController'
import {Screen} from './Screen'

export class GameController {
    private static _instance?: GameController

    private constructor() {
    }

    public static create(scene: IGameScene, input: InputController): (canvas: Canvas) => Promise<void> {
        if (!GameController._instance) {
            GameController._instance = new GameController()
            GameController._instance._defaultScene = scene
            GameController._instance._inputController = input
        }
        return GameController._instance._initCanvas.bind(GameController._instance)
    }

    public readonly FRAME_RATE = 60
    public static DEBUG = true

    protected _dimensions: TScaledSize = Screen.get()
    protected _canvas!: Canvas
    protected _ctx!: CanvasRenderingContext2D

    protected _defaultScene!: IGameScene
    protected _inputController!: InputController

    protected _updateSubscribers: TUpdateSubscriptionsBatch = {
        pre: [],
        default: [],
        post: [],
    }

    protected _renderSubscribers: TRenderSubscriptionsBatch = {
        pre: [],
        default: [],
        post: [],
    }

    protected _updateSubscriptionMap: Map<(TGameUpdateSubscriptionCallback | IEntity), number> = new Map()
    protected _renderSubscriptionMap: Map<(TGameRenderSubscriptionCallback | IEntity), number> = new Map()

    protected _lastFrameTime!: number

    protected _engine!: Engine

    public get engine() {
        return this._engine
    }

    public get dimensions() {
        return this._dimensions
    }

    public get canvas() {
        return this._canvas
    }

    public get ctx() {
        return this._ctx
    }

    public subscribeOnUpdate(subscriber: TGameUpdateSubscriptionCallback | IEntity, stage: keyof TUpdateSubscriptionsBatch = 'default') {
        if ('function' === typeof (subscriber as IEntity)?.update) {
            const i = this._updateSubscribers[stage].push((subscriber as IEntity).update!.bind(subscriber)) - 1
            this._updateSubscriptionMap.set(subscriber, i)
            return
        }

        if ('function' === typeof subscriber) {
            const i = this._updateSubscribers[stage].push(subscriber) - 1
            this._updateSubscriptionMap.set(subscriber, i)
            return
        }
    }

    public unsubscribeUpdate(subscriber: TGameUpdateSubscriptionCallback | IEntity, stage: keyof TUpdateSubscriptionsBatch = 'default') {
        const i = this._updateSubscriptionMap.get(subscriber)
        if(!i || !this._updateSubscribers[stage][i]) {
            return
        }
        this._updateSubscribers[stage] = this._updateSubscribers[stage].filter((_, j) => j !== i)
    }

    public subscribeOnRender(
        subscriber: TGameRenderSubscriptionCallback | IEntity, stage: keyof TRenderSubscriptionsBatch = 'default') {
        if ('function' === typeof (subscriber as IEntity)?.render) {
            const i = this._renderSubscribers[stage].push((subscriber as IEntity).render!.bind(subscriber)) - 1
            this._renderSubscriptionMap.set(subscriber, i)
            return
        }

        if ('function' === typeof subscriber) {
            const i = this._renderSubscribers[stage].push(subscriber) - 1
            this._renderSubscriptionMap.set(subscriber, i)
            return
        }
    }

    public unsubscribeRender(subscriber: TGameRenderSubscriptionCallback | IEntity, stage: keyof TRenderSubscriptionsBatch = 'default') {
        const i = this._renderSubscriptionMap.get(subscriber)
        if(!i || !this._renderSubscribers[stage][i]) {
            return
        }
        this._renderSubscribers[stage] = this._renderSubscribers[stage].filter((_, j) => j !== i)
    }

    protected async _initCanvas(canvas: Canvas) {
        this._canvas = canvas
        canvas.width = this.dimensions.origin.width
        canvas.height = this.dimensions.origin.height

        this._ctx = canvas.getContext('2d')

        // physic engine
        this._engine = Engine.create()

        // load scene
        this._defaultScene.loadingScreenRenderer(this)
        await this._defaultScene.load(this)

        // internal subscriptions
        this._updateSubscribers.pre.push(this._debugModeSwitch.bind(this))
        this._updateSubscribers.post.push(this._updateEngine.bind(this))
        this._renderSubscribers.pre.push(this._clearCanvas.bind(this))
        this._renderSubscribers.post.push(this._renderDebugInfo.bind(this))

        // start game loop
        this._lastFrameTime = Date.now()
        requestAnimationFrame(time => this._gameLoop(time))
    }

    protected _gameLoop(time: number) {
        const delta = time - this._lastFrameTime
        this._lastFrameTime = time
        const fps = Math.floor(1000 / delta)
        let dt = Math.max(0, Number(Math.round(delta / (1000 / this.FRAME_RATE)).toFixed(2)))

        const partKeys = ['pre', 'default', 'post']

        // update
        partKeys.forEach(((part: keyof TUpdateSubscriptionsBatch) => {
            this._updateSubscribers[part].forEach((callback: TGameUpdateSubscriptionCallback) => {
                callback(dt, this._inputController.state, delta, fps)
            })
        }) as any)

        // render
        partKeys.forEach(((part: keyof TRenderSubscriptionsBatch) => {
            this._renderSubscribers[part].forEach((callback: TGameRenderSubscriptionCallback) => {
                callback(this._canvas, this._ctx, dt, this._inputController.state, delta, fps)
            })
        }) as any)

        requestAnimationFrame(time => this._gameLoop(time))
    }

    protected _debugModeSwitch(dt: number, input: TInputState, delta: number, fps: number) {
        GameController.DEBUG = input.debugTrigger
    }

    protected _updateEngine(dt: number, input: TInputState, delta: number, fps: number) {
        Engine.update(this._engine, fps)
    }

    protected _clearCanvas() {
        this._ctx.clearRect(0, 0, this._dimensions.width, this._dimensions.height)
    }

    protected _renderDebugInfo(canvas: Canvas, ctx: CanvasRenderingContext2D, dt: number, input: TInputState, delta: number, fps: number) {
        if (!GameController.DEBUG) {
            return
        }

        ctx.fillStyle = '#ffffff'
        ctx.font = '14px Arial'
        const vOffset = 20 // 80
        ctx.fillText(`FPS: ${fps}`, 20, vOffset)
        ctx.fillText(`Δ: ${delta.toFixed(2)}`, 20, vOffset*2)
        ctx.fillText(`DT: ${dt}`, 20, vOffset*3)
    }
}
