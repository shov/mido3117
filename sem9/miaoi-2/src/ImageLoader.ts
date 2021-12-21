export default async function loadImageOnCanvas(
    canvas: HTMLCanvasElement,
    imgData: string | ArrayBuffer
): Promise<CanvasRenderingContext2D> {
    const img = new Image()
    return await new Promise((r, j) => {
        img.onload = () => {
            try {
                canvas.width = img.width
                canvas.height = img.height
                const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!
                ctx.drawImage(img, 0, 0)
                r(ctx)
            } catch (e: any) {
                j(e)
            }
        }

        // @ts-ignore
        img.src = imgData
    })
}
