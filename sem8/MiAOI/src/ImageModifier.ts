import {EventBus} from './EventBus'

export class ImageModifier {
    protected _ctx?: CanvasRenderingContext2D
    protected _originImageData?: ImageData
    protected _dependedButtons: HTMLElement[] = []

    constructor(protected _bus: EventBus) {
        const xResetBt: HTMLElement = document.querySelector('#x_reset')!
        xResetBt.addEventListener('click', this._xReset.bind(this))
        this._dependedButtons.push(xResetBt)

        const xInvertBt: HTMLElement = document.querySelector('#x_invert')!
        xInvertBt.addEventListener('click', this._xInvert.bind(this))
        this._dependedButtons.push(xInvertBt)

        const xGrayScaleBt: HTMLElement = document.querySelector('#x_grayscale')!
        xGrayScaleBt.addEventListener('click', this._xGrayScale.bind(this))
        this._dependedButtons.push(xGrayScaleBt)
    }

    public initWith(ctx: CanvasRenderingContext2D): ImageModifier {
        this._ctx = ctx
        this._originImageData = ctx
            .getImageData(0, 0,
                this._ctx.canvas.width,
                this._ctx.canvas.height)

        this._dependedButtons.forEach((bt: HTMLElement) => {
            bt.classList.remove('_disabled')
        })
        return this
    }

    protected _xReset() {
        if (!this._ctx || !this._originImageData) {
            return
        }

        this._ctx.putImageData(this._originImageData, 0, 0)
    }

    protected _xInvert() {
        if (!this._ctx) {
            return
        }

        const canvas: HTMLCanvasElement = this._ctx.canvas
        const imageData: ImageData = this._ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data: Uint8ClampedArray = imageData.data

        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i]         // r
            data[i + 1] = 255 - data[i + 1] // g
            data[i + 2] = 255 - data[i + 2] // b
        }

        this._ctx.putImageData(imageData, 0, 0)
    }

    protected _xGrayScale() {
        if (!this._ctx) {
            return
        }

        const canvas: HTMLCanvasElement = this._ctx.canvas
        const imageData: ImageData = this._ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data: Uint8ClampedArray = imageData.data

        for (let i = 0; i < data.length; i += 4) {
            const avg = Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3)
            data[i] = avg     // r
            data[i + 1] = avg // g
            data[i + 2] = avg // b
        }

        this._ctx.putImageData(imageData, 0, 0)
    }

    protected _mustBeInitialized() {
        if (!this._ctx) {
            throw new Error(`Image modifier is not initialized yet!`)
        }
    }
}
