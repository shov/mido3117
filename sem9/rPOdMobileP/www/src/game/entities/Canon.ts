import {IBodiesIssuer, IConstraintsIssuer, IEntity, ScaledSize} from '../GameTypes'
import {Bodies, Body, Constraint} from 'matter-js'
import {Resources} from '../Resources'
import {GameController} from '../GameController'
import {ARenderedBodyIssuer} from '../ARenderedBodyIssuer'

export class Canon extends ARenderedBodyIssuer implements IEntity, IBodiesIssuer, IConstraintsIssuer {
    protected _texture!: HTMLImageElement
    protected _body!: Body
    protected _constraint!: Constraint
    protected _initialShape!: { w: number, h: number, x: number, y: number, }


    constructor(
        protected _dimensions: ScaledSize,
        protected _canvas: HTMLCanvasElement,
        protected _ctx: CanvasRenderingContext2D,
    ) {
        super()
    }

    public async init(x: number, y: number, w: number, h: number, cx: number, cy: number) {
        //this._texture = await Resources.pic('platform-texture')!

        this._initialShape = {w, h, x, y}
        this._body = Bodies.rectangle(x, y, w, h)
        this._constraint = Constraint.create({
            pointA: {x: cx, y: cy},
            bodyB: this._body,
            stiffness: 0.5,
        })
    }

    getDeclaredBodies(): Body[] {
        return [this._body]
    }

    getDeclaredConstraints(): Constraint[] {
        return [this._constraint]
    }

    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, dt: number, delta: number, fps: number): any {
        const vertices = this._body.vertices

        // Rectangle
        const shape = this._initialShape
        // go to pic corner and rotate
        ctx.save()
        ctx.translate(vertices[0].x + (shape.w / 2), vertices[0].y + (shape.h / 2))
        ctx.rotate(this._body.angle)

        let drawY = -(shape.h / 2)
        let drawX = -(shape.w / 2)
        // 32x32 square
        //ctx.drawImage(this._texture, drawX, drawY)

        // back the ctx
        ctx.restore()

        ctx.beginPath()
        ctx.moveTo(this._constraint.pointA.x, this._constraint.pointA.y)
        ctx.lineTo(this._constraint.bodyB.position.x, this._constraint.bodyB.position.y)
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1
        ctx.closePath()
        ctx.stroke()


        if (GameController.DEBUG) {
            this._debugRender(canvas, ctx)
        }
    }
}
