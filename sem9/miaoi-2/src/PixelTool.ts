export declare type TRGBPixel = {
    r: number,
    g: number,
    b: number,
}

export declare type TLabPixel = {
    L: number,
    a: number,
    b: number,
}

export declare type TPixelMatrix<T> = T[][] & {
    get(x: number, y: number): T,
    set(x: number, y: number, pixel: T): void,
}

export declare type TRGB = TPixelMatrix<TRGBPixel>
export declare type TLab = TPixelMatrix<TLabPixel>

export default class PixelTool {
    public static dataToRGB(data: Uint8ClampedArray, w: number): TRGB {
        const result: TRGB = PixelTool.makePixelMatrix<TRGBPixel>()
        for (let i = 0; i < data.length; i += 4) {
            const y = (i / 4 | 0) / w | 0
            if (!Array.isArray(result[y])) {
                result[y] = []
            }

            result[y].push({
                r: data[i],
                g: data[i + 1],
                b: data[i + 2],
            })
        }
        return result
    }

    public static RGBToData(rgb: TRGB, destination?: Uint8ClampedArray): Array<number> {
        let data = []
        let i = 0

        for (let y = 0; y < rgb.length; y++) {
            for (let x = 0; x < rgb[y].length; x++) {
                data.push(rgb[y][x].r)
                data.push(rgb[y][x].g)
                data.push(rgb[y][x].b)
                data.push(255)
                if (destination) {
                    destination[i] = rgb[y][x].r
                    destination[i + 1] = rgb[y][x].g
                    destination[i + 2] = rgb[y][x].b
                }
                i += 4
            }
        }
        return data
    }

    public static RGBToLab(rgb: TRGB): TLab {
        const result: TLab = PixelTool.makePixelMatrix<TLabPixel>()
        for (let y = 0; y < rgb.length; y++) {
            if (!result[y]) {
                result[y] = []
            }
            for (let x = 0; x < rgb[y].length; x++) {
                result[y].push(PixelTool.RGBPixelToLabPixel(rgb[y][x]))
            }
        }
        return result
    }

    public static LabToRGB(lab: TLab): TRGB {
        const result: TRGB = PixelTool.makePixelMatrix<TRGBPixel>()
        for (let y = 0; y < lab.length; y++) {
            if (!result[y]) {
                result[y] = []
            }
            for (let x = 0; x < lab[y].length; x++) {
                result[y].push(PixelTool.LabPixelToRGBPixel(lab[y][x]))
            }
        }
        return result
    }

    public static LabPixelToRGBPixel(lab: TLabPixel): TRGBPixel {
        // src @url https://www.easyrgb.com/en/math.php
        let y = (lab.L + 16) / 116,
            x = lab.a / 500 + y,
            z = y - lab.b / 200,
            r, g, b

        x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16 / 116) / 7.787)
        y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16 / 116) / 7.787)
        z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16 / 116) / 7.787)

        r = x * 3.2406 + y * -1.5372 + z * -0.4986
        g = x * -0.9689 + y * 1.8758 + z * 0.0415
        b = x * 0.0557 + y * -0.2040 + z * 1.0570

        r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1 / 2.4) - 0.055) : 12.92 * r
        g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1 / 2.4) - 0.055) : 12.92 * g
        b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1 / 2.4) - 0.055) : 12.92 * b

        return {
            r: Math.max(0, Math.min(1, r)) * 255,
            g: Math.max(0, Math.min(1, g)) * 255,
            b: Math.max(0, Math.min(1, b)) * 255,
        }
    }


    public static RGBPixelToLabPixel(rgb: TRGBPixel): TLabPixel {
        // src @url https://www.easyrgb.com/en/math.php
        let r = rgb.r / 255,
            g = rgb.g / 255,
            b = rgb.b / 255,
            x, y, z

        r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
        g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
        b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

        x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
        y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
        z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

        x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116
        y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116
        z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116

        return {
            L: (116 * y) - 16,
            a: 500 * (x - y),
            b: 200 * (y - z),
        }
    }

    public static makePixelMatrix<T>(): TPixelMatrix<T> {
        let stub: any = []
        Object.defineProperties(stub, {
            get: {
                value: function (x: number, y: number): T {
                    return (this[y] || {})[x]
                }
            },
            set: {
                value: function (x: number, y: number, pixel: T): void {
                    if (!Array.isArray(this[y])) {
                        this[y] = []
                    }
                    this[y][x] = pixel
                }
            }
        })
        return stub
    }
}
