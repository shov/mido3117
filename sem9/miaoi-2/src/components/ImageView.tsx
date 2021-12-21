import React, {useEffect, useRef} from 'react'
import st from './ImageView.module.scss'
import loadImageOnCanvas from '../ImageLoader'

declare type TImageViewPropList = {
    imgData: string | ArrayBuffer,
    label: string,
}

export function ImageView({imgData, label}: TImageViewPropList) {
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
