import {IEntity, TInputState} from '../GameTypes'
import Canvas, {CanvasRenderingContext2D, Image, Path2D} from 'react-native-canvas'
import {Resources} from '../Resources'

declare type TCloud = {
    velocity: number,
    x: number,
    y: number,
    image: Image,
    w: number,
    h: number,
}

export class Sky implements IEntity {
    protected _cloudList: TCloud[] = []
    protected readonly MAX_CLOUD_NUMBER = 5
    protected readonly SPEED_MIN = 0.3
    protected readonly SPEED_MAX = 0.5

    protected HIGH_MIN!: number
    protected HIGH_MAX!: number
    protected readonly BEHIND_THE_SCENE_MIN = 50
    protected readonly BEHIND_THE_SCENE_MAX = 100

    protected readonly PIC_W_SIDE_COMPRESSION = 0.18
    protected readonly PIC_H_SIDE_COMPRESSION = 0.15
    protected readonly PIC_NUMBER = 3

    protected _canvas!: Canvas

    protected _sprite!: Image
    protected _cloudSpriteList: {
        image: Image,
        w: number,
        h: number,
    }[] = []

    constructor(
        protected _screenWidth: number,
        protected _screenHeight: number,
    ) {
        this.HIGH_MIN = -10
        this.HIGH_MAX = this._screenHeight - this._screenHeight / 2
    }


    public async init(canvas: Canvas) {
        this._canvas = canvas

        const picSrcList = [
            require(`../../assets/cloud_0.png`),
            require(`../../assets/cloud_1.png`),
            require(`../../assets/cloud_2.png`),
        ]

        for (let i = 0; i < this.PIC_NUMBER; i++) {
            const image = new Image(canvas)
            await new Promise(r => {
                image.addEventListener('load', r)
                image.src = Resources.loadImage(`cloud-${i}`, picSrcList[i]).uri
            })
            this._cloudSpriteList[i] = {
                image,
                w: image.width * this.PIC_W_SIDE_COMPRESSION,
                h: image.width * this.PIC_H_SIDE_COMPRESSION,
            }
        }
    }

    protected _makeCloud(canvas: Canvas, picIndex: number): TCloud {
        const startPointY = Math.floor(Math.random() * (this.HIGH_MAX - this.HIGH_MIN + 1)) + this.HIGH_MIN
        const startPointX = Math.floor(Math.random() * this._screenWidth)
        const velocity = Math.floor(Math.random() * (this.SPEED_MAX - this.SPEED_MIN + 1)) + this.SPEED_MIN

        return {
            x: startPointX,
            y: startPointY,
            velocity,
            w: this._cloudSpriteList[picIndex].w,
            h: this._cloudSpriteList[picIndex].h,
            image: this._cloudSpriteList[picIndex].image,
        }
    }

    protected _randomizeCloud(cloud: TCloud) {
        const startPointY = Math.floor(Math.random() * (this.HIGH_MAX - this.HIGH_MIN + 1)) + this.HIGH_MIN
        const startPointX =
            -(Math.floor(Math.random() * (this.BEHIND_THE_SCENE_MAX - this.BEHIND_THE_SCENE_MIN + 1)) + this.BEHIND_THE_SCENE_MIN)
        const velocity = Math.floor(Math.random() * (this.SPEED_MAX - this.SPEED_MIN + 1)) + this.SPEED_MIN

        cloud.x = startPointX
        cloud.y = startPointY
        cloud.velocity = velocity
    }

    public update(dt: number, input: TInputState, delta: number, fps: number): any {
        this._cloudList.forEach(cloud => {
            cloud.x += cloud.velocity * dt
        })

        this._cloudList.forEach(cloud => {
            const rightPoint = cloud.x + cloud.w
            const leftPoint = cloud.x

            if (rightPoint < -this.BEHIND_THE_SCENE_MAX || leftPoint > this._screenWidth) {
                this._randomizeCloud(cloud)
            }
        })

        if (this._cloudList.length < this.MAX_CLOUD_NUMBER) {
            this._cloudList.push(this._makeCloud(
                this._canvas, Math.floor(Math.random() * this.PIC_NUMBER)
            ))
        }
    }

    public render(canvas: Canvas, ctx: CanvasRenderingContext2D, dt: number, input: TInputState, delta: number, fps: number): any {
        // switched to linear gradient in App.tsx
        // ctx.drawImage(this._sprite, 0, 0, this._sprite.width, this._sprite.height, 0, 0, this._screenWidth, this._screenHeight)

        this._cloudList.forEach(cloud => {
            ctx.drawImage(cloud.image, cloud.x, cloud.y, cloud.w, cloud.h)
        })
    }
}
