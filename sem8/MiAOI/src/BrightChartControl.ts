import {IColourUtils} from './ColourUtils'

declare type T_BrControlCouple = {
    bt: HTMLElement,
    sliderList: (({ valueMapping: string[] } & HTMLInputElement) | null)[],
    valueList: (HTMLElement | null)[],
    handler: (couple: T_BrControlCouple, ...args: any[]) => void,
}

declare type T_YMap = { [y: string]: Set<number> }

export class BrightChartControl {
    protected _brcContainer: HTMLElement = document.querySelector('#brc_container')!
    protected _ctx?: CanvasRenderingContext2D
    protected _originYMap: T_YMap = {}
    protected _controls: { [selector: string]: T_BrControlCouple } = {}


    constructor(protected _utils: IColourUtils) {
        Object.entries({
            '#x_brc_threshold': this._xBrThreshold,
            '#x_brc_pshape': this._xBrPShape,
            '#x_brc_hillup': this._xBrHillUp,
            '#x_brc_hilldown': this._xBrHillDown,
        })
            .forEach(([selector, handler]) => {
                this._controls[selector] = {
                    bt: document.querySelector(selector)!,
                    sliderList: ['0', '1',].map(i => document.querySelector(selector + '_slider' + i)),
                    valueList: ['0', '1',].map(i => document.querySelector(selector + '_value' + i)),
                    handler: handler.bind(this),
                }
                this._controls[selector].bt.addEventListener('click', (...args) => {
                    this._controls[selector].handler(this._controls[selector], ...args)
                })
                this._controls[selector].sliderList.forEach((slider, i) => {
                    if (!slider) {
                        return
                    }

                    slider.addEventListener('input', () => {
                        const value: HTMLElement | null = this._controls[selector].valueList[i]
                        if (null === value) {
                            throw Error()
                        }
                        value.innerHTML = slider.valueMapping[parseInt(slider.value)]
                    })
                })
            })
    }

    public resetBrightCharts(ctx: CanvasRenderingContext2D) {
        this._ctx = ctx
        this._brcContainer.classList.remove('_hidden')

        //get all y values, bind them to pixel offsets
        const imageData: ImageData = this._ctx.getImageData(0, 0, this._ctx.canvas.width, this._ctx.canvas.height)
        const yuvMatrix = this._utils.matrix.RBGToYUV(imageData.data)

        // reset
        this._originYMap = {}
        for (let i = 0; i < yuvMatrix.length; i += 4) {
            const y = String(yuvMatrix[i])
            const offset = i

            if (!this._originYMap[y]) {
                this._originYMap[y] = new Set()
            }

            this._originYMap[y].add(offset)
        }


        // set/re-set controls
        Object.entries(this._controls)
            .forEach(([selector, couple]) => {
                const {sliderList, valueList} = couple
                ;[0, 1].forEach((i: number) => {
                    const slider: ({ valueMapping: string[] } & HTMLInputElement) | null = sliderList[i]
                    const value: HTMLElement | null = valueList[i]
                    if (null === value || null === slider) {
                        return
                    }

                    slider.setAttribute('min', '0')
                    slider.setAttribute('max', String(Object.keys(this._originYMap).length - 1))
                    slider.valueMapping = Object.keys(this._originYMap).sort((a, b) => parseInt(a) - parseInt(b))

                    const mid = Math.floor(slider.valueMapping.length / 2)
                    slider.setAttribute('value', String(mid))
                    value.innerHTML = String(slider.valueMapping[mid])
                })
            })
    }

    protected _xBrThreshold(couple: T_BrControlCouple, ...args: any[]): void {
        const MAX_Y = 255
        const MIN_Y = 0

        const thresholdY = parseInt(couple.valueList[0]!.innerHTML)

        this._manipulateOnYUVAndUpdate((yuvMatrix, yMap, yKey) => {
            const y: number = parseInt(yKey)
            ;[...yMap[yKey]].forEach(offset => {
                yuvMatrix[offset] = y >= thresholdY ? MAX_Y : MIN_Y
            })
        })
    }

    protected _xBrPShape(couple: T_BrControlCouple, ...args: any[]): void {
        const MAX_Y = 255
        const MIN_Y = 0

        const a = parseInt(couple.valueList[0]!.innerHTML)
        const b = parseInt(couple.valueList[1]!.innerHTML)

        const aY = a <= b ? a : b
        const bY = a <= b ? b : a

        this._manipulateOnYUVAndUpdate((yuvMatrix, yMap, yKey) => {
            const y: number = parseInt(yKey)
            ;[...yMap[yKey]].forEach(offset => {
                yuvMatrix[offset] = (y >= aY && y <= bY) ? MAX_Y : MIN_Y
            })
        })
    }

    protected _xBrHillUp(couple: T_BrControlCouple, ...args: any[]): void {
        const MAX_Y = 255
        const MIN_Y = 0

        const a = parseInt(couple.valueList[0]!.innerHTML)
        const b = parseInt(couple.valueList[1]!.innerHTML)

        const aY = a <= b ? a : b
        const bY = a <= b ? b : a

        this._manipulateOnYUVAndUpdate((yuvMatrix, yMap, yKey) => {
            const y: number = parseInt(yKey)
            ;[...yMap[yKey]].forEach(offset => {
                yuvMatrix[offset] = y < aY ? MIN_Y : (y > bY ? MAX_Y : y)
            })
        })
    }

    protected _xBrHillDown(couple: T_BrControlCouple, ...args: any[]): void {
        const MAX_Y = 255
        const MIN_Y = 0

        const a = parseInt(couple.valueList[0]!.innerHTML)
        const b = parseInt(couple.valueList[1]!.innerHTML)

        const aY = a <= b ? a : b
        const bY = a <= b ? b : a

        this._manipulateOnYUVAndUpdate((yuvMatrix, yMap, yKey) => {
            const y: number = parseInt(yKey)
            ;[...yMap[yKey]].forEach(offset => {
                yuvMatrix[offset] = y < aY ? MAX_Y : (y > bY ? MIN_Y : y)
            })
        })
    }

    protected _manipulateOnYUVAndUpdate(cb: (yuvMatrix: number[], yMap: T_YMap, yKey: string) => void): void {
        if (!this._ctx) {
            throw new Error('No context set!')
        }

        const yMap = this._originYMap
        const utils = this._utils
        const ctx: CanvasRenderingContext2D = this._ctx

        const imageData: ImageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
        const yuvMatrix = utils.matrix.RBGToYUV(imageData.data)

        Object.keys(yMap).forEach((yKey: string) => {
            cb(yuvMatrix, yMap, yKey)
        })

        const rgbMatrix = utils.matrix.YUVtoRGB(yuvMatrix)
        for (let i = 0; i < rgbMatrix.length; i++) {
            imageData.data[i] = rgbMatrix[i]
        }
        ctx.putImageData(imageData, 0, 0)

        this.resetBrightCharts(this._ctx)
    }
}