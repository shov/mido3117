import React, {useRef, useState} from 'react'
import st from './Menu.module.scss'
import ImageTool from '../ImageTool'
import {Button, Fab} from 'rmwc'
import loadImageOnCanvas from '../ImageLoader'

declare type TMenuPropList = {
    uploadDoneWith: any,
    convertInterface: () => ({
        setLabel: any,
        setDestImage: any,
        srcImage: string | ArrayBuffer
    }),
}

export function Menu({uploadDoneWith, convertInterface}: TMenuPropList) {
    const uploadField = useRef<HTMLInputElement>(null)
    const [isOrigin, setIsOrigin] = useState(false)

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
                    setIsOrigin(true)
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
            <Button
                onClick={(e) => {
                    e.preventDefault()
                    sobel()
                }}
                title={'Sobel Filter'}
                raised
                // @ts-ignore
                className={{disable: st.Disable}}
                disabled={!isOrigin}
            >Sobel</Button>
            <Button
                onClick={(e) => {
                    e.preventDefault()
                    prewittFilter()
                }}
                title={'Prewitt Filter'}
                raised
                // @ts-ignore
                className={{disable: st.Disable}}
                disabled={!isOrigin}
            >Prewitt</Button>
        </div>
    )
}
