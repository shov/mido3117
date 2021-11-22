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
    // assetPath: string,
    // assetOffset: number,
    // frameNumber: number,
}

export const treatTypeList = [
    {
        name: 'red-star',
        score: 25,
        zones: ['A', 'B', 'B', 'D', 'D', 'E',],
        luckTest: (rand: number) => {
            return rand > 0.8
        },
        fillColor: '#ee1616',
        fallingVelocity: 2,
    },
    {
        name: 'gray_fish',
        score: 25,
        zones: ['A', 'B', 'B', 'C', 'C', 'C', 'C', 'C', 'D', 'D', 'E',],
        luckTest: (rand: number) => {
            return rand > 0.3
        },
        fillColor: '#008bff',
        fallingVelocity: 6,
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
            w: 24,
            h: 24,
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

    public render(canvas: Canvas, ctx: CanvasRenderingContext2D, dt: number, input: TInputState, delta: number, fps: number): any {
        if (this._hidden) {
            return
        }
        this._debugRender(canvas, ctx)
    }
}
