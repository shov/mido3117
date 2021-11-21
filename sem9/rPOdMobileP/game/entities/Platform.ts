import {IBodiesIssuer, IEntity} from '../GameTypes'
import {Asset} from 'expo-asset'
import {Resources} from '../Resources'
import {Bodies, Body} from 'matter-js'
import {ScaledSize} from 'react-native'
import Canvas, {CanvasRenderingContext2D, Path2D, Image} from 'react-native-canvas'

export class Platform implements IEntity, IBodiesIssuer {
    protected _texture!: Image
    protected _body!: Body
    protected _dimensions!: ScaledSize
    protected _initialShape!: {w: number, h: number, x: number, y: number,}

    public async init(dimensions: ScaledSize, canvas: Canvas, ctx: CanvasRenderingContext2D) {
        this._dimensions = dimensions

        this._texture = new Image(canvas)
        this._texture.src = Resources
            .loadImage('platform-texture', require('../../assets/platform.png'))
            .uri

        await new Promise(r => {
            this._texture.addEventListener('load', r)
        })


        const w = (dimensions.width / 4) - ((dimensions.width / 4) % 32)
        const h = 32
        const x = dimensions.width - w / 2 - 80
        const y = (dimensions.height / 4 * 2.5)

        this._initialShape = {w,h,x,y}
        this._body = Bodies.rectangle(x, y, w, h, {isStatic: true, angle: 45 * (Math.PI / 180)})
    }

    public getDeclaredBodies(): Body[] {
        return [this._body]
    }

    public update(dt: number) {
        this._body.angle += (Math.PI / 180) / 2
    }

    public render(canvas: Canvas, ctx: CanvasRenderingContext2D) {

        const pen = new Path2D(canvas)
        const vertices = this._body.vertices

        pen.moveTo(vertices[0].x, vertices[0].y)

        for (let j = 1; j < vertices.length; j += 1) {
            pen.lineTo(vertices[j].x, vertices[j].y)
        }

        // Rectangle
        const shape = this._initialShape
        // go to pic corner and rotate
        ctx.save()
        ctx.translate(vertices[0].x, vertices[0].y)
        ctx.rotate(this._body.angle)

        let drawY = -(shape.h / 2)
        let drawX = -(shape.w / 2)
        while (drawY < (shape.h / 2)) {
            while (drawX < (shape.w / 2)) {
                ctx.drawImage(this._texture, drawX, drawY)
                drawX += this._texture.width
            }
            drawY += this._texture.height
        }

        // back the ctx
        ctx.restore()
    }
}
