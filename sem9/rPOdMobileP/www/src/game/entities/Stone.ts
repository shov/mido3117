import {IBodiesIssuer, IEntity, ScaledSize} from '../GameTypes'
import {Bodies, Body} from 'matter-js'
import {Resources} from '../Resources'
import {GameController} from '../GameController'
import {ARenderedBodyIssuer} from '../ARenderedBodyIssuer'

export class Stone extends ARenderedBodyIssuer implements IEntity, IBodiesIssuer {
    protected _body!: Body
    protected _initialShape!: { s: number, r: number, x: number, y: number, }
    // @ts-ignore
    protected _fillColor = Resources.COLOR_GEM_LIST[Math.floor(Math.random() * 10)]

    constructor(
        protected _dimensions: ScaledSize,
        protected _canvas: HTMLCanvasElement,
        protected _ctx: CanvasRenderingContext2D,
    ) {
        super()
    }

    async init(x: number, y: number): Promise<void> {
        const s = 8
        const r = 16

        this._initialShape = {x, y, s, r}
        this._body = Bodies.polygon(x, y, s, r, {friction: 10, frictionStatic: 10, frictionAir: 0, restitution: 0, density: 1})
    }

    getDeclaredBodies(): Body[] {
        return [this._body]
    }

    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, dt: number, delta: number, fps: number): any {
        const vertices = this._body.vertices

        ctx.beginPath()
        ctx.moveTo(vertices[0].x, vertices[0].y)

        for (let j = 1; j < vertices.length; j++) {
            ctx.lineTo(vertices[j].x, vertices[j].y)
        }
        ctx.lineTo(vertices[0].x, vertices[0].y)

        ctx.fillStyle = this._fillColor
        ctx.fill()

        if (GameController.DEBUG) {
            this._debugRender(canvas, ctx)
        }
    }
}
