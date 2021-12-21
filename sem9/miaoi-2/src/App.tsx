import React, {useEffect, useRef, useState} from 'react'
import './App.scss'
import st from './ComponentStyle.module.scss'
import {Fab} from 'rmwc'
import ImageTool from './ImageTool'

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
    convertInterface: () => ({
        setLabel: any,
        setDestImage: any,
        srcImage: string | ArrayBuffer
    }),
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

    function sobel() {
        const {setDestImage, srcImage, setLabel} = convertInterface()
        const canvas = document.createElement('canvas')
        loadImageOnCanvas(canvas, srcImage)
            .then(ctx => {
                const imageData: ImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

                ImageTool.SobelFilter(imageData, canvas.width)

                ctx.putImageData(imageData, 0, 0)
                setDestImage(canvas.toDataURL('image/png'))
                setLabel('Filtered by Sobel')
            })
            .catch(e => alert(e.message))
    }

    function prewittFilter() {
        const {setDestImage, srcImage, setLabel} = convertInterface()
        const canvas = document.createElement('canvas')
        loadImageOnCanvas(canvas, srcImage)
            .then(ctx => {
                const imageData: ImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

                ImageTool.PrewittFilter(imageData, canvas.width)

                ctx.putImageData(imageData, 0, 0)
                setDestImage(canvas.toDataURL('image/png'))
                setLabel('Filtered by Prewitt')
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
            }} mini icon={'upload'} title={'Start: Upload a pic'} />
            <Fab onClick={sobel} mini icon={'star'} />
            <Fab onClick={prewittFilter} mini icon={'autorenew'} title={'Prewitt Filter'} />
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

function ViewArea({children}: { children: any }) {
    return (
        <div className={st.ViewArea}>
            {children}
        </div>
    )

}

function App() {
    const [srcImage, setSrcImage] = useState('')
    const [destImage, setDestImage] = useState('')
    const [destLabel, setDestLabel] = useState('No result yet, upload image and click on a filer')

    return (
        <div className="App">
            <Menu
                uploadDoneWith={setSrcImage}
                convertInterface={() => ({
                    setDestImage,
                    srcImage,
                    setLabel: setDestLabel,
                })}
            />
            <ViewArea>
                <ImageView label={'Original'} imgData={srcImage} />
                <ImageView label={destLabel} imgData={destImage} />
            </ViewArea>
        </div>
    )
}

export default App
