import {colorsys} from './colorsys'

declare type T_RGBPcl = {
    r: number, g: number, b: number,
}

declare type T_HSVPcl = {
    h: number, s: number, v: number,
}

export class PixelUtils {
    public RBGToHSV({r, g, b}: T_RGBPcl): T_HSVPcl {
        this.int0to255(r)
        this.int0to255(g)
        this.int0to255(b)

        const [dR, dG, dB] = [r, g, b].map(v255 => v255 / 255)

        const [min, , max] = [dR, dG, dB].sort((a, b) => a - b)

        let hDelta: number, addDegree: number

        switch (true) {
            case(dR === max && dG >= dB):
                hDelta = dG - dB
                addDegree = 0
                break
            case(dR === max): // thus dG < dB
                hDelta = dG - dB
                addDegree = 360
                break
            case(dG === max):
                hDelta = dB - dR
                addDegree = 120
                break
            case (dB === max):
                hDelta = dR - dG
                addDegree = 240
                break
            default:
                throw new Error('Wrong max calculation!')
        }

        const h = max === min ? 0 : 60 * (hDelta / (max - min)) + addDegree
        const s = max > 0 ? Math.round((1 - min / max) * 100) : 0
        const v = Math.round(max * 100)

        return {h, s, v}
    }

    public HSVToRGB({h, s, v}: T_HSVPcl): T_RGBPcl {
        this.realInRange(h, 0, 360)
        this.realInRange(s, 0, 100)
        this.realInRange(v, 0, 100)


        const h_i = Math.floor(h / 60) % 6
        const v_min = ((100 - s) * v) / 100
        const a = (v - v_min) * ((h % 60) / 60)
        const v_inc = v_min + a
        const v_dec = v - a

        const realRGB = [
            [v, v_inc, v_min], // 0
            [v_dec, v, v_min], // 1
            [v_min, v, v_inc], // 2
            [v_min, v_dec, v], // 3
            [v_inc, v_min, v], // 4
            [v, v_min, v_dec], // 5
        ][h_i]

        const rgb255 = realRGB.map(percent => Math.floor(percent * 255 / 100))
        const [r, g, b] = rgb255
        return {r, g, b}
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

export class ThirdPartyPixelUtils extends PixelUtils {
    public RBGToHSV({r, g, b}: T_RGBPcl): T_HSVPcl {
        return colorsys.rgb2Hsv({r, g, b})
    }

    public HSVToRGB({h, s, v}: T_HSVPcl): T_RGBPcl {
        return colorsys.hsv2Rgb({h, s, v})
    }
}

// All matrix arrays are one dimension, every 0,1,2 elements are
// for rgb/hsl every 3rd one for alpha and not involved in conversions

export class MatrixUtils {
    protected _pcl: PixelUtils = new PixelUtils()

    public RBGToHSV(rgbMatrix: Uint8ClampedArray | number[]): number[] {
        const result: number[] = []

        for (let i = 0; i < rgbMatrix.length; i += 4) {
            const hsv: T_HSVPcl = this._pcl.RBGToHSV({
                r: rgbMatrix[i],
                g: rgbMatrix[i + 1],
                b: rgbMatrix[i + 2],
            })

            result.push(hsv.h)
            result.push(hsv.s)
            result.push(hsv.v)
            result.push(rgbMatrix[i + 3])
        }

        return result
    }

    public HSVToRGB(hsvMatrix: number[]): number[] {
        const result: number[] = []

        for (let i = 0; i < hsvMatrix.length; i += 4) {
            const rgb: T_RGBPcl = this._pcl.HSVToRGB({
                h: hsvMatrix[i],
                s: hsvMatrix[i + 1],
                v: hsvMatrix[i + 2],
            })

            result.push(rgb.r)
            result.push(rgb.g)
            result.push(rgb.b)
            result.push(hsvMatrix[i + 3])
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