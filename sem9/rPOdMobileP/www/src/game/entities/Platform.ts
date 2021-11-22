import {IBodiesIssuer, IEntity, ScaledSize} from '../GameTypes'
import {Resources} from '../Resources'
import {Bodies, Body} from 'matter-js'
import {GameController} from '../GameController'
import {ARenderedBodyIssuer} from '../ARenderedBodyIssuer'

export class Platform extends ARenderedBodyIssuer implements IEntity, IBodiesIssuer {
    protected _texture!: HTMLImageElement
    protected _body!: Body
    protected _initialShape!: { w: number, h: number, x: number, y: number, }

    constructor(
        protected _dimensions: ScaledSize,
        protected _canvas: HTMLCanvasElement,
        protected _ctx: CanvasRenderingContext2D,
    ) {
        super()
    }

    public async init(x: number, y: number, w: number, h: number) {
        //this._texture = await Resources.loadImage('platform-texture', 'cdvfile://localhost/persistent//assets/platform.png')

        this._initialShape = {w, h, x, y}
        this._body = Bodies.rectangle(x, y, w, h, {isStatic: true})
    }

    public getDeclaredBodies(): Body[] {
        return [this._body]
    }

    public render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        const vertices = this._body.vertices

        // Rectangle
        const shape = this._initialShape
        // go to pic corner and rotate
        // ctx.save()
        // ctx.translate(vertices[0].x + (shape.w / 2), vertices[0].y + (shape.h / 2))
        // ctx.rotate(this._body.angle)
        //
        // let drawY = -(shape.h / 2)
        // let drawX = -(shape.w / 2)
        // while (drawY < (shape.h / 2)) {
        //     while (drawX < (shape.w / 2)) {
        //         ctx.drawImage(this._texture, drawX, drawY)
        //         drawX += this._texture.width
        //     }
        //     drawY += this._texture.height
        // }
        //
        // // back the ctx
        // ctx.restore()

        if (GameController.DEBUG) {
            this._debugRender(canvas, ctx)
        }
    }
}
