import {IBodiesIssuer, IEntity} from '../GameTypes'
import {ScaledSize} from 'react-native'
import Canvas, {Path2D, CanvasRenderingContext2D, Image} from 'react-native-canvas'
import {Bodies, Body} from 'matter-js'
import {Resources} from '../Resources'
import {GameController} from '../GameController'
import {ARenderedBodyIssuer} from '../ARenderedBodyIssuer'

export class Stone extends ARenderedBodyIssuer implements IEntity, IBodiesIssuer {
    protected _texture!: Image
    protected _body!: Body
    protected _initialShape!: { s: number, r: number, x: number, y: number, }
    // @ts-ignore
    protected _fillColor = Resources.COLOR_GEM_LIST[Math.floor(Math.random() * 10)]

    constructor(
        protected _dimensions: ScaledSize,
        protected _canvas: Canvas,
        protected _ctx: CanvasRenderingContext2D,
    ) {
        super()
    }

    async init(x: number, y: number): Promise<void> {
        this._texture = new Image(this._canvas)

        const s = 8
        const r = 16

        this._initialShape = {x, y, s, r}
        this._body = Bodies.polygon(x, y, s, r, {friction: 10, frictionStatic: 10, frictionAir: 0, restitution: 0, density: 1})
    }

    getDeclaredBodies(): Body[] {
        return [this._body]
    }

    render(canvas: Canvas, ctx: CanvasRenderingContext2D, dt: number, delta: number, fps: number): any {
        const vertices = this._body.vertices
        const pen = new Path2D(canvas)

        pen.moveTo(vertices[0].x, vertices[0].y)

        for (let j = 1; j < vertices.length; j++) {
            pen.lineTo(vertices[j].x, vertices[j].y)
        }
        pen.lineTo(vertices[0].x, vertices[0].y)

        ctx.fillStyle = this._fillColor
        ctx.fill(pen)

        if (GameController.DEBUG) {
            this._debugRender(canvas, ctx)
        }
    }
}
