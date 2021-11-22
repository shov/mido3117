import {IBodiesIssuer, IConstraintsIssuer, IEntity, TInputState} from '../GameTypes'
import {ScaledSize} from 'react-native'
import Canvas, {Path2D, CanvasRenderingContext2D, Image} from 'react-native-canvas'
import {Bodies, Body, Constraint} from 'matter-js'
import {Resources} from '../Resources'
import {GameController} from '../GameController'
import {ARenderedBodyIssuer} from '../ARenderedBodyIssuer'

export class Canon extends ARenderedBodyIssuer implements IEntity, IBodiesIssuer, IConstraintsIssuer {
    protected _texture!: Image
    protected _body!: Body
    protected _constraint!: Constraint
    protected _initialShape!: { w: number, h: number, x: number, y: number, }


    constructor(
        protected _dimensions: ScaledSize,
        protected _canvas: Canvas,
        protected _ctx: CanvasRenderingContext2D,
    ) {
        super()
    }

    public async init(x: number, y: number, w: number, h: number, cx: number, cy: number) {
        this._texture = new Image(this._canvas)
        this._texture.src = Resources
            .pic('platform-texture')!
            .uri

        await new Promise(r => {
            this._texture.addEventListener('load', r)
        })

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

    render(canvas: Canvas, ctx: CanvasRenderingContext2D, dt: number, input: TInputState, delta: number, fps: number): any {
        const pen = new Path2D(canvas)
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
        ctx.drawImage(this._texture, drawX, drawY)

        // back the ctx
        ctx.restore()

        pen.moveTo(this._constraint.pointA.x, this._constraint.pointA.y)
        pen.lineTo(this._constraint.bodyB.position.x, this._constraint.bodyB.position.y)
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1
        ctx.stroke(pen)


        if (GameController.DEBUG) {
            this._debugRender(canvas, ctx)
        }
    }
}
