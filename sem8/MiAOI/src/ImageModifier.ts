import {EventBus} from './EventBus'
import {IColourUtils} from './ColourUtils'
import {BrightChartControl} from './BrightChartControl'

export class ImageModifier {
    protected _ctx?: CanvasRenderingContext2D
    protected _originImageData?: ImageData
    protected _dependedButtons: HTMLElement[] = []

    constructor(
        protected _bus: EventBus,
        protected _utils: IColourUtils,
        protected _bcControl: BrightChartControl,) {
        Object.entries({
            '#x_reset': this._xReset,
            '#x_invert': this._xInvert,
            '#x_grayscale': this._xGrayScale,
            '#x_make_brighter': this._xMakeBrighter,
        }).forEach(([selector, cb]) => {
            const bt: HTMLElement = document.querySelector(selector)!
            bt.addEventListener('click', cb.bind(this))
            this._dependedButtons.push(bt)
        })
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

        this._bcControl.insertChart(this._ctx)
        return this
    }

    protected _xReset() {
        if (!this._ctx || !this._originImageData) {
            return
        }

        this._ctx.putImageData(this._originImageData, 0, 0)
        this._bcControl.insertChart(this._ctx)
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

    protected _xMakeBrighter() {
        if (!this._ctx) {
            return
        }

        const canvas: HTMLCanvasElement = this._ctx.canvas
        const imageData: ImageData = this._ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data: Uint8ClampedArray = imageData.data

        const hsvMatrix = this._utils.matrix.RBGToHSV(data)
        for (let i = 0; i < hsvMatrix.length; i += 4) {
            const s = i + 1
            const v = i + 2

            hsvMatrix[s] = hsvMatrix[s] - 10 < 0 ? 0 : hsvMatrix[s] - 10
            hsvMatrix[v] = hsvMatrix[v] + 10 > 100 ? 100 : hsvMatrix[v] + 10
        }

        const rgbMatrix = this._utils.matrix.HSVToRGB(hsvMatrix)
        for (let i = 0; i < rgbMatrix.length; i++) {
            data[i] = rgbMatrix[i]
        }

        this._ctx.putImageData(imageData, 0, 0)
    }

    protected _mustBeInitialized() {
        if (!this._ctx) {
            throw new Error(`Image modifier is not initialized yet!`)
        }
    }
}
