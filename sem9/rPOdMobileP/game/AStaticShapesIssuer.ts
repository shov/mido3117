import {TStaticShape} from './GameTypes'
import Canvas, {CanvasRenderingContext2D, Path2D} from 'react-native-canvas'
import {GameController} from './GameController'

export abstract class AStaticShapesIssuer {
    getDeclaredShapes(): TStaticShape[] {
        return []
    }

    protected _updateShapeVertices() {
        const shapeList = this.getDeclaredShapes()
        shapeList.forEach(shape => {
            const rad = shape.angle * (Math.PI / 180)
            if (shape.kind === 'rect') {

                const offsets = [
                    {x: -(shape.w! / 2), y: -(shape.h! / 2)},
                    {x: +(shape.w! / 2), y: -(shape.h! / 2)},
                    {x: +(shape.w! / 2), y: +(shape.h! / 2)},
                    {x: -(shape.w! / 2), y: +(shape.h! / 2)},
                ]

                ;[0, 1, 2, 3].forEach(i => {

                    shape.vertices[i] = {
                        // x' = originX + offsetX*cos(t) - offsetX*sin(t)
                        x: shape.x + offsets[i].x * Math.cos(rad) - offsets[i].y * Math.sin(rad),
                        // y' = originY + offsetX*sin(t) + offsetY*cos(t)
                        y: shape.y + offsets[i].x * Math.sin(rad) + offsets[i].y * Math.cos(rad),
                    }
                })
            }
        })
    }

    protected _debugRender(canvas: Canvas, ctx: CanvasRenderingContext2D) {
        if(!GameController.DEBUG) {
            return
        }

        this.getDeclaredShapes().forEach(shape => {
            const vertices = shape.vertices
            const pen = new Path2D(canvas)

            pen.moveTo(vertices[0].x, vertices[0].y)

            for (let j = 1; j < vertices.length; j++) {
                pen.lineTo(vertices[j].x, vertices[j].y)
            }
            pen.lineTo(vertices[0].x, vertices[0].y)

            if(shape.fillColor) {
                ctx.fillStyle = shape.fillColor
                ctx.fill(pen)
            }

            ctx.lineWidth = 1
            ctx.strokeStyle = shape.color || '#fff906'
            ctx.stroke(pen)
        })
    }
}
