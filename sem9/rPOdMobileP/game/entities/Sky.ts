import {IEntity, TInputState} from '../GameTypes'
import Canvas, {CanvasRenderingContext2D, Image, Path2D} from 'react-native-canvas'
import {Resources} from '../Resources'

declare type TCloudFigure = {
    oX: number,
    oY: number,
    rX: number,
    rY: number,
    penKit: Path2D[],
}
declare type TCloud = {
    velocity: number,
    originX: number,
    originY: number,
    x: number,
    y: number,
    figures: TCloudFigure[]
}

export class Sky implements IEntity {
    protected _cloudList: TCloud[] = []
    protected readonly MAX_CLOUD_NUMBER = 5
    protected readonly SPEED_MIN = 0.3
    protected readonly SPEED_MAX = 0.5
    protected readonly OFFSET_MIN = 8
    protected readonly OFFSET_MAX = 10
    protected HIGH_MIN!: number
    protected HIGH_MAX!: number
    protected readonly BEHIND_THE_SCENE_MIN = 50
    protected readonly BEHIND_THE_SCENE_MAX = 100
    protected readonly COLOR_GREY = '#b0b0b0'
    protected readonly COLOR_WHITE = '#ffffff'

    protected _canvas!: Canvas

    protected _sprite!: Image

    constructor(
        protected _screenWidth: number,
        protected _screenHeight: number,
    ) {
        this.HIGH_MIN = -10
        this.HIGH_MAX = this._screenHeight - this._screenHeight / 2
    }


    public async init(canvas: Canvas) {
        this._canvas = canvas

        // this._sprite = new Image(canvas)
        // await new Promise(r => {
        //     this._sprite.addEventListener('load', r)
        //     this._sprite.src = Resources.loadImage('boat-default', require('../../assets/sky.png')).uri
        // })
    }

    protected _makeCloud(canvas: Canvas): TCloud {
        const startPointY = Math.floor(Math.random() * (this.HIGH_MAX - this.HIGH_MIN + 1)) + this.HIGH_MIN
        const startPointX = Math.floor(Math.random() * this._screenWidth)
        const velocity = Math.floor(Math.random() * (this.SPEED_MAX - this.SPEED_MIN + 1)) + this.SPEED_MIN

        const cloud: TCloud = {
            originX: startPointX,
            originY: startPointY,
            x: startPointX,
            y: startPointY,
            velocity,
            figures: []
        }

        // First two clouds are horizontal
        { // right one
            const oX = Math.floor(Math.random() * (this.OFFSET_MAX - this.OFFSET_MIN + 1)) + this.OFFSET_MIN
            const oY = 0
            const rX = Math.floor(Math.random() * (30 - 18 + 1)) + 18
            const rY = Math.floor(Math.random() * (19 - 15 + 1)) + 15

            cloud.figures.push({oX, oY, rX, rY, penKit: []})
        }
        { // left one
            const oX = -(Math.floor(Math.random() * (this.OFFSET_MAX - this.OFFSET_MIN + 1)) + this.OFFSET_MIN)
            const oY = 0
            const rX = Math.floor(Math.random() * (30 - 20 + 1)) + 20
            const rY = Math.floor(Math.random() * (20 - 15 + 1)) + 15

            cloud.figures.push({oX, oY, rX, rY, penKit: []})
        }


        // Third one is a bit above them
        { // top one
            const oX = -this.OFFSET_MIN
            const oY = -(Math.floor(Math.random() * (this.OFFSET_MAX - this.OFFSET_MIN + 1)) + this.OFFSET_MIN)
            const rX = Math.floor(Math.random() * (17 - 13 + 1)) + 13

            cloud.figures.push({oX, oY, rX, rY: rX, penKit: []})
        }

        // Fill the path
        cloud.figures.forEach((figure, num) => {
            if ([0, 1].includes(num)) {
                const x = cloud.x + figure.oX - 1
                const y = cloud.y + figure.oY + 1

                const pen = new Path2D(canvas)
                pen.ellipse(x, y, figure.rX, figure.rY, Math.PI / 180, 0, 2 * Math.PI)
                figure.penKit.push(pen)
            }
            {
                const x = cloud.x + figure.oX
                const y = cloud.y + figure.oY

                const pen = new Path2D(canvas)
                pen.ellipse(x, y, figure.rX, figure.rY, Math.PI / 180, 0, 2 * Math.PI)
                figure.penKit.push(pen)
            }
        })

        return cloud
    }

    protected _randomizeCloud(cloud: TCloud) {
        const startPointY = Math.floor(Math.random() * (this.HIGH_MAX - this.HIGH_MIN + 1)) + this.HIGH_MIN
        const startPointX =
            -(Math.floor(Math.random() * (this.BEHIND_THE_SCENE_MAX - this.BEHIND_THE_SCENE_MIN + 1)) + this.BEHIND_THE_SCENE_MIN)
        const velocity = Math.floor(Math.random() * (this.SPEED_MAX - this.SPEED_MIN + 1)) + this.SPEED_MIN

        cloud.x = startPointX
        cloud.originX = startPointX
        cloud.y = startPointY
        cloud.originY = startPointY
        cloud.velocity = velocity
    }

    public update(dt: number, input: TInputState, delta: number, fps: number): any {
        this._cloudList.forEach(cloud => {
            cloud.x += cloud.velocity * dt
        })

        this._cloudList.forEach(cloud => {
            const farCloudEdge = Math.max(...cloud.figures.map(f => Math.abs(f.oX) + f.rX))
            const rightPoint = cloud.x + farCloudEdge
            const leftPoint = cloud.x - farCloudEdge

            if(rightPoint < -this.BEHIND_THE_SCENE_MAX || leftPoint > this._screenWidth) {
                this._randomizeCloud(cloud)
            }
        })

        if (this._cloudList.length < this.MAX_CLOUD_NUMBER) {
            this._cloudList.push(this._makeCloud(this._canvas))
        }
    }

    public render(canvas: Canvas, ctx: CanvasRenderingContext2D, dt: number, input: TInputState, delta: number, fps: number): any {
        // switched to linear gradient in App.tsx
        // ctx.drawImage(this._sprite, 0, 0, this._sprite.width, this._sprite.height, 0, 0, this._screenWidth, this._screenHeight)

        const palette = {
            1: [this.COLOR_WHITE],
            2: [this.COLOR_GREY, this.COLOR_WHITE],
        }

        this._cloudList.forEach(cloud => {
            cloud.figures.forEach((figure) => {
                ctx.save()
                ctx.translate(cloud.x - cloud.originX, cloud.y - cloud.originY)

                figure.penKit.forEach((pen, num, kit) => {
                    ctx.fillStyle = palette[kit.length as keyof (typeof palette)][num]
                    ctx.fill(pen)
                })
                ctx.restore()
            })
        })

    }
}
