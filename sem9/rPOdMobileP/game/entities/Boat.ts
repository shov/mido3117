import {IEntity, TInputState, TStaticShape} from '../GameTypes'
import Canvas, {CanvasRenderingContext2D, Image} from 'react-native-canvas'
import {AStaticShapesIssuer} from '../AStaticShapesIssuer'
import {Resources} from '../Resources'

export class Boat extends AStaticShapesIssuer implements IEntity {
    protected readonly BOAT_SPEED = 4
    protected readonly WAVE_SPEED = 0.3
    protected readonly WAVE_OFFSET = 5
    protected readonly WAVE_ANGLE_SPEED = 0.3
    protected readonly WAVE_ANGLE_OFFSET = 5


    protected _shape!: TStaticShape
    public get shape() {
        return this._shape
    }

    protected _yBaseLine!: number
    protected _velocity: { x: number, y: number } = {x: 0, y: this.WAVE_SPEED}
    protected _angleVelocity: number = this.WAVE_ANGLE_SPEED
    protected _boatIsMoving = false
    protected _turnedRight = false

    protected _boundaries!: { left: number, right: number }

    protected _sprite!: Image


    constructor() {
        super()
        this._shape = {
            kind: 'rect',
            w: 80,
            h: 40,
            x: 0, y: 0, angle: 0,
            vertices: []
        }
    }


    async init(canvas: Canvas, x: number, y: number, boundaries: { left: number, right: number }) {
        this._shape.x = x
        this._shape.y = y
        this._updateShapeVertices()
        this._yBaseLine = y
        this._boundaries = boundaries

        this._sprite = new Image(canvas)
        await new Promise(r => {
            this._sprite.addEventListener('load', r)
            this._sprite.src = Resources.loadImage('boat-default', require('../../assets/boat-default.png')).uri
        })
    }

    public getDeclaredShapes(): TStaticShape[] {
        return [this._shape]
    }

    update(dt: number, input: TInputState, delta: number, fps: number): any {
        const boatWasMoving = this._boatIsMoving
        if (input.leftSideTrigger && !input.rightSideTrigger) {
            this._velocity.x = -this.BOAT_SPEED
            this._shape.angle = 30

            this._turnedRight = false
            this._boatIsMoving = true

        } else if (input.rightSideTrigger && !input.leftSideTrigger) {
            this._velocity.x = this.BOAT_SPEED
            this._shape.angle = -30

            this._turnedRight = true
            this._boatIsMoving = true

        } else {

            this._velocity.x = 0

            if (boatWasMoving) { // stop right after moving
                this._shape.angle = 0
            } else { // wave angle

                if (this._shape.angle <= -this.WAVE_ANGLE_OFFSET) {
                    this._angleVelocity = this.WAVE_ANGLE_SPEED
                }

                if (this._shape.angle >= this.WAVE_ANGLE_OFFSET) {
                    this._angleVelocity = -this.WAVE_ANGLE_SPEED
                }
                this._shape.angle += this._angleVelocity
            }
            this._boatIsMoving = false
        }

        const leftBorderReached = (this._boundaries.left >= this._shape.x - (this._shape.w! / 2))
        const rightBorderReached = (this._boundaries.right <= this._shape.x + (this._shape.w! / 2))
        if ((!leftBorderReached && this._velocity.x < 0) || (!rightBorderReached && this._velocity.x > 0)) {
            this._shape.x += this._velocity.x * dt
        }

        if (this._shape.y < this._yBaseLine - this.WAVE_OFFSET) {
            this._velocity.y = this.WAVE_SPEED
        }

        if (this._shape.y > this._yBaseLine + this.WAVE_OFFSET) {
            this._velocity.y = -this.WAVE_SPEED
        }

        this._shape.y += this._velocity.y * dt

       this._updateShapeVertices()
    }

    render(canvas: Canvas, ctx: CanvasRenderingContext2D, dt: number, input: TInputState, delta: number, fps: number): any {

        const shape = this._shape
        if(!shape.w || !shape.h) {
            throw new Error('Boat shape must have h and w!')
        }

        ctx.save()
        ctx.translate(shape.x, shape.y)
        ctx.rotate(shape.angle * (Math.PI / 180))

        if(this._turnedRight) {
            ctx.scale(-1, 1)
        }

        let drawY = -(shape.h / 2)
        let drawX = -(shape.w / 2)
        ctx.drawImage(this._sprite, drawX, drawY)

        // back the ctx
        ctx.restore()

        this._debugRender(canvas, ctx)
    }

}
