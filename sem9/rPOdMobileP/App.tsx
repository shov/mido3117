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
    const max = 30
    let pinch = 0.2

    return () => {

        clearCanvas(canvas, ctx)

        images.forEach(i => {
            ctx.drawImage(i, 100, 100, i.width, i.height)
        })

        // @ts-ignore
        // for (let place of touches) {
        //     if (place.radius < 1) {
        //         continue
        //     }
        //
        //     if (place.radius > max) {
        //         place.multiplier = -1
        //     }
        //
        //     place.radius += pinch * place.multiplier
        //     if (place.radius < 1) {
        //         continue
        //     }
        //
        //     drawBall(canvas, ctx, place.x, place.y, place.radius + 4, place.color)
        // }
    }
}

async function loadImages(canvas: Canvas) {
    const i = new CanvasImage(canvas)
    const asset = Asset.fromModule(require('./assets/Retro-Mario-2-icon.png'));
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

    setInterval(getGameLoop(canvas, ctx, images), 15)
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
                  // touches.push({
                  //     radius: 1,
                  //     multiplier: 1,
                  //     x: e.nativeEvent.locationX,
                  //     y: e.nativeEvent.locationY,
                  //     color: '#ffcf55',
                  // })
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
        backgroundColor: '#000',
        flex: 1,
    },
    canvas: {
        backgroundColor: '#fff',
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
    }
})

