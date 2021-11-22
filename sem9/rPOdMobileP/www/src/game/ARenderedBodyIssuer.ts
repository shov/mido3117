import {IBodiesIssuer} from './GameTypes'
import {Body} from 'matter-js'

export abstract class ARenderedBodyIssuer implements IBodiesIssuer {
    getDeclaredBodies(): Body[] {
        return [];
    }

    protected _debugRender(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.getDeclaredBodies().forEach(body => {
            const vertices = body.vertices

            ctx.beginPath()
            ctx.moveTo(vertices[0].x, vertices[0].y)

            for (let j = 1; j < vertices.length; j++) {
                ctx.lineTo(vertices[j].x, vertices[j].y)
            }
            ctx.lineTo(vertices[0].x, vertices[0].y)

            ctx.lineWidth = 1
            ctx.strokeStyle = '#fff906'
            ctx.closePath()
            ctx.stroke()
        })
    }
}
