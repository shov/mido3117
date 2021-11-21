import {IBodiesIssuer} from './GameTypes'
import {Body} from 'matter-js'
import Canvas, {CanvasRenderingContext2D, Path2D} from 'react-native-canvas'

export abstract class ARenderedBodyIssuer implements IBodiesIssuer {
    getDeclaredBodies(): Body[] {
        return [];
    }

    protected _debugRender(canvas: Canvas, ctx: CanvasRenderingContext2D) {
        this.getDeclaredBodies().forEach(body => {
            const vertices = body.vertices
            const pen = new Path2D(canvas)

            pen.moveTo(vertices[0].x, vertices[0].y)

            for (let j = 1; j < vertices.length; j++) {
                pen.lineTo(vertices[j].x, vertices[j].y)
            }
            pen.lineTo(vertices[0].x, vertices[0].y)

            ctx.lineWidth = 1
            ctx.strokeStyle = '#fff906'
            ctx.stroke(pen)
        })
    }
}
