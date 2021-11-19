import {StatusBar} from 'expo-status-bar'
import React from 'react'
import {StyleSheet, Text, View, TouchableWithoutFeedback, Dimensions} from 'react-native'
import Canvas, {Path2D} from 'react-native-canvas'
import {PanGestureHandler} from "react-native-gesture-handler"

const D = Dimensions.get('screen')

let touches: Array<any> = []

function drawBall(canvas: any, ctx: { fillStyle: string; fill: (arg0: any) => void }, x: any, y: any, ballRadius: any) {
  const arc = new Path2D(canvas)
  arc.arc(x, y, ballRadius, 0, Math.PI * 2)
  ctx.fillStyle = "#70a355"
  ctx.fill(arc)
}

function drawRectBg(canvas: any, ctx: any) {
  ctx.fillStyle = '#2c3161'

  ctx.fillRect(0, 0, D.width, D.height)
}

function getGameLoop(canvas: any, ctx: any) {
  const max = 30
  let pinch = 5

  return () => {

    drawRectBg(canvas, ctx)


    // @ts-ignore
    for (let [i, place] of touches.entries()) {
      if (place.radius < 1) {
        continue
      }

      if (place.radius > max) {
        place.multiplayer = -1
      }

      place.radius += pinch * place.multiplayer
      if (place.radius < 1) {
        continue
      }
      drawBall(canvas, ctx, place.locationX, place.locationY, place.radius)
    }
  }
}

function handleCanvas(canvas: any) {
  canvas.width = D.width
  canvas.height = D.height
  const ctx = canvas.getContext('2d')
  console.log(D)
  setInterval(getGameLoop(canvas, ctx), 15)
}

function handleTouch(e: any) {
  touches.push({
    locationX: e.nativeEvent.x,
    locationY: e.nativeEvent.y,
    radius: 1,
    multiplayer: 1,
  })
}

export default function App() {
  return (
      <View style={styles.container}>
        <StatusBar hidden={true}/>
        <PanGestureHandler style={styles.container} onGestureEvent={handleTouch}>
          <View style={styles.canvas}>
            <Canvas style={styles.canvas} ref={handleCanvas}/>
          </View>
        </PanGestureHandler>
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

