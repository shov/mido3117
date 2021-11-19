import {StatusBar} from 'expo-status-bar'
import React from 'react'
import {StyleSheet, Text, View, TouchableWithoutFeedback, Dimensions} from 'react-native'
import Canvas, {Path2D, CanvasRenderingContext2D, Image as CanvasImage} from 'react-native-canvas'
import {PanGestureHandler} from "react-native-gesture-handler"
import {Asset} from 'expo-asset'
import {Engine, Composite, Bodies, World} from 'matter-js'

const D = Dimensions.get('screen')

let lastTouch = [D.width / 2, D.height / 2]
let engine: Engine

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
        let dt = Number(Math.round(delta / (1000 / frameRate)).toFixed(2))

        Engine.update(engine, fps)
        clearCanvas(canvas, ctx)
        const bodiesNumber = render(canvas)

        ctx.fillStyle = '#ffffff'
        ctx.font = '16px Arial'
        ctx.fillText(`FPS: ${fps}`, 20, 80)
        ctx.fillText(`Δ: ${delta.toFixed(2)}`, 20, 100)
        ctx.fillText(`DT: ${dt}`, 20, 120)
        ctx.fillText(`◇: ${bodiesNumber}`, 20, 140)
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

function render(canvas: Canvas) {
    const ctx = canvas.getContext('2d')
    let bodies = Composite.allBodies(engine.world)

    const pen = new Path2D(canvas)

    for (let i = 0; i < bodies.length; i += 1) {
        let vertices = bodies[i].vertices

        if(!bodies[i].isStatic && (vertices[0].y > D.height || vertices[0].x < 0 || vertices[0].x > D.width)) {
            World.remove(engine.world, bodies[i])
            console.log('removed body')
            continue
        }

        pen.moveTo(vertices[0].x, vertices[0].y)

        for (let j = 1; j < vertices.length; j += 1) {
            pen.lineTo(vertices[j].x, vertices[j].y)
        }

        pen.lineTo(vertices[0].x, vertices[0].y)
    }

    ctx.lineWidth = 1
    ctx.strokeStyle = '#fff906'
    ctx.stroke(pen)

    return bodies.length
}

async function handleCanvas(canvas: Canvas) {
    canvas.width = D.width
    canvas.height = D.height
    const ctx = canvas.getContext('2d')
    console.log(D)

    const images = await loadImages(canvas)

    // matter
    engine = Engine.create()
    let boxA = Bodies.rectangle(180, 0, 50, 50)
    let boxB = Bodies.rectangle(200, 50, 50, 50, {

    })
    let ground = Bodies.rectangle(400, 610, 810, 60, {isStatic: true})
    Composite.add(engine.world, [boxA, boxB, ground])

    // _matter

    requestAnimationFrame(getGameLoop(canvas, ctx, images))
}

export default function App() {
    return (
        <View style={styles.container}
              onTouchStart={({nativeEvent}) => {
                  Composite.add(engine.world, [
                      Bodies.rectangle(
                          nativeEvent.locationX,
                          nativeEvent.locationY,
                          50,
                          50,
                      )
                  ])
              }
              }
              onTouchMove={(e) => {
                  lastTouch = [e.nativeEvent.locationX, e.nativeEvent.locationY]
              }
              }
        >
            <StatusBar hidden={true} />
            <Canvas style={styles.canvas} ref={handleCanvas} />
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

