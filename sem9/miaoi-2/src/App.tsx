import React, {useEffect, useRef, useState} from 'react'
import './App.scss'
import st from './Comp.module.scss'
import {Fab} from 'rmwc'

declare type TMenuPropList = {
    uploadDoneWith: any,
    convertDoneWith: any,
}

function Menu({uploadDoneWith, convertDoneWith}: TMenuPropList) {
    const uploadField = useRef<HTMLInputElement>(null)
    function upload() {
        try {
            if(uploadField.current) {
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
                if(uploadField.current) {
                    uploadField.current.click()
                }
            }} mini icon={'upload'} />
            <Fab mini icon={'autorenew'} />
        </div>
    )
}

declare type TImageViewPropList = {
    imgData: string | ArrayBuffer,
}

function ImageView({imgData}: TImageViewPropList) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        try {
            if (canvasRef.current) {
                const canvas = canvasRef.current
                const img = new Image()
                img.onload = () => {
                    try {
                        canvas.width = img.width
                        canvas.height = img.height
                        const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!
                        ctx.drawImage(img, 0, 0)
                        // todo null upload bt value
                    } catch (e: any) {
                        alert(e.message)
                    }
                }
                // @ts-ignore
                img.src = imgData
            }
        } catch (e: any) {
            alert(e.message)
        }
    }, [imgData])

    return (
        <div className={st.ImageView}>
            <div className={st.ScrollBox}>
                <canvas ref={canvasRef} />
            </div>
        </div>
    )
}

function App() {
    const [srcImage, setSrcImage] = useState('')
    const [destImage, setDestImage] = useState('')

    return (
        <div className="App">
            <Menu uploadDoneWith={setSrcImage} convertDoneWith={setDestImage}/>
            <ImageView imgData={srcImage} />
            <ImageView imgData={destImage} />
        </div>
    )
}

export default App
