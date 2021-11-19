import {StatusBar} from 'expo-status-bar'
import React from 'react'
import {StyleSheet, Text, View, TouchableWithoutFeedback, Dimensions} from 'react-native'
import Canvas, {Path2D, CanvasRenderingContext2D, Image as CanvasImage} from 'react-native-canvas'
import {PanGestureHandler} from "react-native-gesture-handler"
import {Asset} from 'expo-asset'

const D = Dimensions.get('screen')

let touches: Array<{
    radius: number,
    multiplier: number,
    x: number,
    y: number,
    color: string,
}> = []
let lastTouch = [D.width / 2, D.height / 2]

function drawBall(canvas: Canvas, ctx: CanvasRenderingContext2D, x: any, y: any, ballRadius: any, color: string) {
    const arc = new Path2D(canvas)
    arc.arc(x, y, ballRadius, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill(arc)
}

function clearCanvas(canvas: Canvas, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, D.width, D.height)
}

function getGameLoop(canvas: Canvas, ctx: CanvasRenderingContext2D, images: CanvasImage[]) {
    const frameRate = 60
    let prevTime = Date.now()

    const gameLoop = (time: number) => {
        const delta = time - prevTime
        prevTime = time
        const fps = Math.floor(1000 / delta)
        let dt = Math.round(delta / (1000 / frameRate)).toFixed(2)



        clearCanvas(canvas, ctx)

        images.forEach(i => {
            ctx.drawImage(i, lastTouch[0], lastTouch[1], i.width, i.height)
        })

        ctx.fillStyle = '#ffffff'
        ctx.font = '30px Arial'
        ctx.fillText(`FPS: ${fps}`, 20, 80)
        ctx.fillText(`DT: ${dt}`, 20, 120)
        requestAnimationFrame(time => gameLoop(time))
    }
    return gameLoop
}

async function loadImages(canvas: Canvas): Promise<CanvasImage[]> {
    const i = new CanvasImage(canvas)
    const asset = Asset.fromModule(require('./assets/Retro-Mario-2-icon.png'))
    i.src = asset.uri

    return await new Promise(r => {
        i.addEventListener('load', () => {
            r([i])
        })
    })
}

async function handleCanvas(canvas: Canvas) {
    canvas.width = D.width
    canvas.height = D.height
    const ctx = canvas.getContext('2d')
    console.log(D)

    const images = await loadImages(canvas)

    requestAnimationFrame(getGameLoop(canvas, ctx, images))
}

export default function App() {
    return (
        <View style={styles.container}
              onTouchStart={(e) => {
                  // touches.push({
                  //     radius: 1,
                  //     multiplier: 1,
                  //     x: e.nativeEvent.locationX,
                  //     y: e.nativeEvent.locationY,
                  //     color: '#ff5555',
                  // })
              }
              }
              onTouchMove={(e) => {
                  lastTouch = [e.nativeEvent.locationX, e.nativeEvent.locationY]
              }
              }
        >
            <StatusBar hidden={true} />
            <View style={styles.canvas}>
                <Canvas style={styles.canvas} ref={handleCanvas} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ff0000',
        flex: 1,
    },
    canvas: {
        backgroundColor: '#000000',
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
    }
})

