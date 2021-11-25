import {IEntity, TInputState, TStaticShape} from '../GameTypes'
import Canvas, {CanvasRenderingContext2D, Image, Path2D} from 'react-native-canvas'

export class Ocean implements IEntity {

    protected _waveRenderer!: (canvas: Canvas, ctx: CanvasRenderingContext2D, dt: number, color: string, velocity: number, verticalShift: number) => void

    constructor(
        protected _oceanBottom: number,
        protected _oceanWidth: number,
        protected _waterLine: number,
        protected _velocity: number,
        protected _baseColor: string,
    ) {

    }


    public async init(canvas: Canvas, ctx: CanvasRenderingContext2D) {
        let baseCounter = 0
        let counter = 0
        const pen = this._movePen(new Path2D(canvas), 0, this._waterLine)
        const walkingSize = 37.5

        this._waveRenderer = (canvas: Canvas, ctx: CanvasRenderingContext2D, dt: number, color: string, velocity: number, verticalShift: number, skipDraw = false) => {
            baseCounter += dt * 0.25 * velocity

            if (
                (velocity > 0 && baseCounter >= walkingSize)
                || (velocity < 0 && baseCounter <= -walkingSize)
            ) {
                baseCounter = 0
            }

            counter = baseCounter

            ctx.save()
            ctx.translate(counter, 0)
            ctx.fillStyle = color
            ctx.fill(pen)
            ctx.restore()
        }
    }

    protected _movePen(pen: Path2D, counter: number, verticalShift: number): Path2D {
        let leftBorder = -this._oceanWidth / 2
        let rightBorder = this._oceanWidth * 1.5

        let x = leftBorder, y = this._oceanBottom
        pen.moveTo(x, y)
        y = verticalShift
        pen.lineTo(x, y)


        let increase = 90 / 180 * Math.PI / 9


        for (let i = leftBorder / 2; i <= rightBorder; i += 1) {
            x = i
            y = verticalShift - Math.sin(counter) * 3
            counter += increase

            pen.lineTo(x, y)
        }

        y = verticalShift
        x = rightBorder
        pen.lineTo(x, y)

        y = this._oceanBottom
        pen.lineTo(x, y)

        x = 0
        pen.lineTo(x, y)

        return pen
    }

    public update(dt: number, input: TInputState, delta: number, fps: number): any {

    }

    public render(canvas: Canvas, ctx: CanvasRenderingContext2D, dt: number, input: TInputState, delta: number, fps: number): any {
        this._waveRenderer(canvas, ctx, dt, this._baseColor, this._velocity, this._waterLine)
    }
}
