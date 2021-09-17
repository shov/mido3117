// Image loader
import {EventBus} from 'EventBus';

export class ImageLoader {
    protected _loadBt: HTMLInputElement = document.querySelector('#image_file')!

    constructor(protected _bus: EventBus) {
        this._loadBt.addEventListener('change', this._loadImage.bind(this))
    }

    protected _loadImage() {
        try {
            if (!this._loadBt?.files?.length) {
                throw new Error('Cannot load file!')
            }

            const file = this._loadBt?.files[0]

            const fr = new FileReader()
            fr.onload = () => {
                if (null === fr.result) {
                    this._bus.emit('error', 'Cannot read image content!')
                    return
                }

                this._createImage(fr.result)
            }
            fr.readAsDataURL(file)

        } catch (e: any) {
            this._bus.emit('error', e.message)
        }
    }

    protected _createImage(imageResult: string | ArrayBuffer) {
        try {
            const img = new Image()
            img.onload = () => {
                this._imageLoaded(img)
            }
            // @ts-ignore
            img.src = imageResult

        } catch (e: any) {
            this._bus.emit('error', e.message)
        }
    }

    protected _imageLoaded(img: HTMLImageElement) {
        try {
            const canvas: HTMLCanvasElement = document.querySelector('#canvas2d')!
            canvas.width = img.width
            canvas.height = img.height
            const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!
            ctx.drawImage(img, 0, 0)
        } catch (e: any) {
            this._bus.emit('error', e.message)
        }
    }
}
