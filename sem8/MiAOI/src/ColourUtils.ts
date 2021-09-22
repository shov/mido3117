declare type T_RGBPcl = {
    r: number, g: number, b: number,
}

declare type T_YUVPcl = {
    y: number, u: number, v: number,
}

export class PixelUtils {

    public RGBtoYUV({r, g, b}: T_RGBPcl): T_YUVPcl {
        this.int0to255(r)
        this.int0to255(g)
        this.int0to255(b)

        // approximately BT.601 YCbCr
        return {
            y: Math.floor(r * .299000 + g * .587000 + b * .114000),
            u: Math.floor(r * -.168736 + g * -.331264 + b * .500000 + 128),
            v: Math.floor(r * .500000 + g * -.418688 + b * -.081312 + 128),
        }
    }

    public YUVtoRGB({y, u, v}: T_YUVPcl): T_RGBPcl {
        // approximately BT.601 YCbCr
        return {
            r: this.clamp(Math.floor(y + 1.4075 * (v - 128)), 0, 255),
            g: this.clamp(Math.floor(y - 0.3455 * (u - 128) - (0.7169 * (v - 128))), 0, 255),
            b: this.clamp(Math.floor(y + 1.7790 * (u - 128)), 0, 255),
        }
    }

    protected clamp(n: number, min: number, max: number): number {
        return n < min
            ? min
            : (n > max ? max : n)
    }

    protected int0to255(n: number) {
        if (n < 0 || n > 255 || Math.floor(n) !== n) {
            throw new TypeError('Value is not an int or not in in [0,255] range!')
        }
    }

    protected realInRange(n: number, a = 0, b = 1) {
        if (n < a || n > b) {
            throw new TypeError(`Value is over the range [${a},${b}] !`)
        }
    }
}

// All matrix arrays are one dimension, every 0,1,2 elements are
// for rgb/hsl/yuv every 3rd one for alpha and not involved in conversions

export class MatrixUtils {
    protected _pcl: PixelUtils = new PixelUtils()

    public RBGToYUV(rgbMatrix: Uint8ClampedArray | number[]): number[] {
        const result: number[] = []

        for (let i = 0; i < rgbMatrix.length; i += 4) {
            const yuv: T_YUVPcl = this._pcl.RGBtoYUV({
                r: rgbMatrix[i],
                g: rgbMatrix[i + 1],
                b: rgbMatrix[i + 2],
            })

            result.push(yuv.y)
            result.push(yuv.u)
            result.push(yuv.v)
            result.push(rgbMatrix[i + 3])
        }

        return result
    }

    public YUVtoRGB(yuvMatrix: number[]): number[] {
        const result: number[] = []

        for (let i = 0; i < yuvMatrix.length; i += 4) {
            const rgb: T_RGBPcl = this._pcl.YUVtoRGB({
                y: yuvMatrix[i],
                u: yuvMatrix[i + 1],
                v: yuvMatrix[i + 2],
            })

            result.push(rgb.r)
            result.push(rgb.g)
            result.push(rgb.b)
            result.push(yuvMatrix[i + 3])
        }

        return result
    }
}

export interface IColourUtils {
    pcl: PixelUtils,
    matrix: MatrixUtils,
}

export const colourUtils: IColourUtils = {
    pcl: new PixelUtils(),
    matrix: new MatrixUtils(),
}