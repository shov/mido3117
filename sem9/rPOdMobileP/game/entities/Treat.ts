import {AStaticShapesIssuer} from '../AStaticShapesIssuer'
import {IEntity, TInputState, TStaticShape} from '../GameTypes'
import Canvas, {CanvasRenderingContext2D, Image} from 'react-native-canvas'
import {Resources} from '../Resources'
import {Boat} from './Boat'

declare type TTreatType = {
    name: string,
    score: number,
    zones: string[],
    luckTest: (rand: number) => boolean,
    fillColor: string,
    fallingVelocity: number,

    asset?: {
        offset: number,
        w: number,
        h: number,
    },
    frameNumber?: number,
}

export const treatTypeList = [
    {
        name: 'emerald-star',
        score: 120,
        zones: ['B', 'D',],
        luckTest: (rand: number) => {
            return rand > 0.81
        },
        fillColor: '#009c00',
        fallingVelocity: 2,
        asset: {
            offset: 384,
            w: 128,
            h: 128,
        },
        frameNumber: 4,
    },
    {
        name: 'red-star',
        score: 70,
        zones: ['A', 'B', 'B', 'D', 'D', 'E',],
        luckTest: (rand: number) => {
            return rand > 0.8
        },
        fillColor: '#ee1616',
        fallingVelocity: 2,
        asset: {
            offset: 256,
            w: 128,
            h: 128,
        },
        frameNumber: 4,
    },
    {
        name: 'golden_fish',
        score: 30,
        zones: ['B', 'C', 'C', 'C', 'C', 'C', 'D',],
        luckTest: (rand: number) => {
            return rand > 0.6
        },
        fillColor: '#c4c161',
        fallingVelocity: 3,
        asset: {
            offset: 128,
            w: 128,
            h: 128,
        },
        frameNumber: 4,
    },
    {
        name: 'gray_fish',
        score: 25,
        zones: ['A', 'B', 'B', 'C', 'C', 'C', 'C', 'C', 'D', 'D', 'E',],
        luckTest: (rand: number) => {
            return rand > 0.5
        },
        fillColor: '#008bff',
        fallingVelocity: 5,
        asset: {
            offset: 0,
            w: 128,
            h: 128,
        },
        frameNumber: 4,
    },
]

export class Treat extends AStaticShapesIssuer implements IEntity {

    protected _shape!: TStaticShape
    public get shape() {
        return this._shape
    }

    protected readonly OVER_SKY_START = -50

    protected _velocity: { x: number, y: number } = {x: 0, y: 0}

    protected _sprite!: Image

    public get type() {
        return this._type
    }

    protected _type!: TTreatType

    protected _hidden = false


    constructor(
        protected _boat: Boat
    ) {
        super()
        this._shape = {
            kind: 'rect',
            w: 32,
            h: 32,
            x: 0, y: 0, angle: 0,
            vertices: []
        }
    }


    async init(canvas: Canvas, x: number, y: number, type: TTreatType,) {
        this._shape.x = x
        this._shape.y = y
        this._updateShapeVertices()
        this._type = type
        this._shape.fillColor = type.fillColor
        this._velocity.y = type.fallingVelocity

        this._sprite = new Image(canvas)
        await new Promise(r => {
            this._sprite.addEventListener('load', r)
            this._sprite.src = Resources.loadImage('treats', require('../../assets/treats.png')).uri
        })
    }

    public getDeclaredShapes(): TStaticShape[] {
        return [this._shape]
    }

    protected _onSinkSubscriber: (...args: any[]) => void = () => {
    }

    public onSink(cb: (...args: any[]) => void) {
        this._onSinkSubscriber = cb
    }

    protected _onBoatCollideSubscriber: (...args: any[]) => void = () => {
    }

    public onBoatCollide(cb: (...args: any[]) => void) {
        this._onBoatCollideSubscriber = cb
    }

    public update(dt: number, input: TInputState, delta: number, fps: number): any {
        if (this._hidden) {
            return
        }

        // collide boat
        const boatCollision = (
            this._shape.x > this._boat.shape.vertices[0].x + 0 // bow
            && this._shape.x < this._boat.shape.vertices[2].x - 0 // stern and the captain
            && this._shape.y >= this._boat.shape.y
            && this._shape.y <= this._boat.shape.y + (this._boat.shape.w! / 2 * 3)
        )


        // sink into the ocean
        const sinkIntoTheOcean = this._shape.y > this._boat.shape.y + (this._boat.shape.w! / 2)

        if (!sinkIntoTheOcean && !boatCollision) {
            this._shape.y += this._velocity.y * dt
        } else {
            if (boatCollision) {
                this._onBoatCollideSubscriber(this)
            } else if (sinkIntoTheOcean) {
                this._onSinkSubscriber(this)
            }
            this._hidden = true
        }

        this._updateShapeVertices()
    }

    protected _deltaProgress = 0
    protected _currFrame = 0
    protected _frameRate = 200

    public render(canvas: Canvas, ctx: CanvasRenderingContext2D, dt: number, input: TInputState, delta: number, fps: number): any {
        this._deltaProgress += delta
        if (this._hidden) {
            return
        }

        // Animation
        if (typeof this._type.frameNumber === 'number' && typeof this._type.asset === 'object') {
            const frameOffsets = []
            let lastFrame
            for (let i = 0; i < this._type.frameNumber; i++) {
                const num: number = frameOffsets.push({
                    x: lastFrame ? lastFrame.x + this._type.asset.w : 0,
                    y: this._type.asset.offset,
                }) - 1
                lastFrame = frameOffsets[num]
            }


            if (this._deltaProgress > this._frameRate) {
                this._deltaProgress = 0
                this._currFrame++
                if (this._currFrame >= this._type.frameNumber) {
                    this._currFrame = 0
                }
            }

            ctx.drawImage(
                this._sprite,
                frameOffsets[this._currFrame].x,
                frameOffsets[this._currFrame].y,
                this._type.asset.w,
                this._type.asset.h,
                this._shape.x - this._shape.w! / 2,
                this._shape.y - this._shape.h! / 2,
                this._shape.w!,
                this._shape.h!,
            )
        }

        this._debugRender(canvas, ctx)
    }
}
