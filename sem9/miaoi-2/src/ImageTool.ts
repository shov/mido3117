import PixelTool, {TLabPixel, TPixelMatrix} from './PixelTool'

declare type TKernel3 = [
    [number, number, number],
    [number, number, number],
    [number, number, number],
]

export default class ImageTool {
    public static PrewittFilter(imageData: ImageData, w: number) {
        const kernelX: TKernel3 = [
            [-1, 0, +1],
            [-1, 0, +1],
            [-1, 0, +1],
        ]

        const kernelY: TKernel3 = [
            [-1, -1, -1],
            [+0, +0, +0],
            [+1, +1, +1],
        ]

        const lab = PixelTool.RGBToLab(PixelTool.dataToRGB(imageData.data, w))
        const filteredLab = ImageTool.filterForKernel3<TLabPixel>(
            kernelX,
            kernelY,
            lab,
            'L',
        )

        PixelTool.RGBToData(PixelTool.LabToRGB(filteredLab), imageData.data)
    }

    public static SobelFilter(imageData: ImageData, w: number) {
        const kernelX: TKernel3 = [
            [-1, 0, +1],
            [-2, 0, +2],
            [-1, 0, +1],
        ]

        const kernelY: TKernel3 = [
            [-1, -2, -1],
            [+0, +0, +0],
            [+1, +2, +1],
        ]

        const lab = PixelTool.RGBToLab(PixelTool.dataToRGB(imageData.data, w))
        const filteredLab = ImageTool.filterForKernel3<TLabPixel>(
            kernelX,
            kernelY,
            lab,
            'L',
        )

        PixelTool.RGBToData(PixelTool.LabToRGB(filteredLab), imageData.data)
    }

    public static filterForKernel3<TPixel>(
        kernelX: TKernel3,
        kernelY: TKernel3,
        dataMatrix: TPixelMatrix<TPixel>,
        c: keyof TPixel,
    ): TPixelMatrix<TPixel> {
        const resultMatrix = PixelTool.makePixelMatrix<TPixel>()

        const height = dataMatrix.length
        const width = dataMatrix[0].length
        const get = (x: number, y: number): number => {
            const safeX = x < width ? Math.abs(x) : width - (x % (width - 1))
            const safeY = y < height ? Math.abs(y) : height - (y % (height - 1))

            // @ts-ignore
            return dataMatrix.get(safeX, safeY)[c]
        }
        const set = (x: number, y: number, value: number) => {
            const resultPixel: TPixel = {
                ...dataMatrix.get(x, y),
                [c]: value
            }
            resultMatrix.set(x, y, resultPixel)
        }

        const runForKernel = (kernel: TKernel3, x: number, y: number): number => {
            return [
                kernel[0][0] * get(x - 1, y - 1),
                kernel[0][1] * get(x + 0, y - 1),
                kernel[0][2] * get(x + 1, y - 1),
                kernel[1][0] * get(x - 1, y + 0),
                kernel[1][1] * get(x + 0, y + 0),
                kernel[1][2] * get(x + 1, y + 0),
                kernel[2][0] * get(x - 1, y + 1),
                kernel[2][1] * get(x + 0, y + 1),
                kernel[2][2] * get(x + 1, y + 1)
            ].reduce((acc, val) => acc + val, 0)
        }

        for (let y = 0; y < dataMatrix.length; y++) {
            for (let x = 0; x < dataMatrix[y].length; x++) {

                const Gx = runForKernel(kernelX, x, y)
                const Gy = runForKernel(kernelY, x, y)
                const result = Math.sqrt((Gx * Gx) + (Gy * Gy)) | 0
                set(x, y, result)
            }
        }
        return resultMatrix
    }
}
