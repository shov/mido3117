import React, {useEffect, useRef, useState} from 'react'
import './App.scss'
import st from './Comp.module.scss'
import {Fab} from 'rmwc'

async function loadImageOnCanvas(
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

declare type TMenuPropList = {
    uploadDoneWith: any,
    convertInterface: () => ({ setDestImage: any, srcImage: string | ArrayBuffer }),
}

function Menu({uploadDoneWith, convertInterface}: TMenuPropList) {
    const uploadField = useRef<HTMLInputElement>(null)

    function upload() {
        try {
            if (uploadField.current) {
                const input = uploadField.current
                //@ts-ignore
                const file = input.files[0]

                const fr = new FileReader()
                fr.onload = () => {
                    if (null === fr.result) {
                        alert('Cannot read image content!')
                        return
                    }

                    uploadDoneWith(fr.result)
                    //@ts-ignore
                    input.value = null
                }
                fr.readAsDataURL(file)
            }
        } catch (e: any) {
            alert(e.message)
        }
    }

    function convert() {
        const {setDestImage, srcImage} = convertInterface()
        const canvas = document.createElement('canvas')
        loadImageOnCanvas(canvas, srcImage)
            .then(ctx => {
                const imageData: ImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const data: Uint8ClampedArray = imageData.data

                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i]         // r
                    data[i + 1] = 255 - data[i + 1] // g
                    data[i + 2] = 255 - data[i + 2] // b
                }

                ctx.putImageData(imageData, 0, 0)
                setDestImage(canvas.toDataURL('image/png'))
            })
            .catch(e => alert(e.message))
    }

    return (
        <div className={st.Menu}>
            <input
                ref={uploadField}
                type={'file'}
                style={{display: 'none'}}
                accept={'image/*'}
                onChange={upload}
            />
            <Fab onClick={() => {
                if (uploadField.current) {
                    uploadField.current.click()
                }
            }} mini icon={'upload'} />
            <Fab onClick={convert} mini icon={'autorenew'} />
        </div>
    )
}

declare type TImageViewPropList = {
    imgData: string | ArrayBuffer,
    label: string,
}

function ImageView({imgData, label}: TImageViewPropList) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        try {
            if (canvasRef.current) {
                const canvas = canvasRef.current
                loadImageOnCanvas(canvas, imgData).catch(e => alert(e.message))
            }
        } catch (e: any) {
            alert(e.message)
        }
    }, [imgData])

    return (
        <div className={st.ImageView}>
            <div className={st.ScrollBox}>
                <canvas ref={canvasRef} />
                <div className={st.Label}>{label}</div>
            </div>
        </div>
    )
}

function ViewArea({children}: {children: any}) {
    return (
        <div className={st.ViewArea}>
            {children}
        </div>
    )

}

function App() {
    const [srcImage, setSrcImage] = useState('')
    const [destImage, setDestImage] = useState('')

    return (
        <div className="App">
            <Menu
                uploadDoneWith={setSrcImage}
                convertInterface={() => ({
                    setDestImage,
                    srcImage,
                })}
            />
            <ViewArea>
                <ImageView label={'Original RGB'} imgData={srcImage} />
                <ImageView label={`RGB -> Lab -> L'ab -> RGB`} imgData={destImage} />
            </ViewArea>
        </div>
    )
}

export default App
