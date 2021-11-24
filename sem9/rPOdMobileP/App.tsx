import React from 'react'
import {StatusBar} from 'expo-status-bar'
import {StyleSheet, View} from 'react-native'
import Canvas from 'react-native-canvas'

import {GameController} from './game/GameController'
import {GameScene} from './game/GameScene'
import {InputController} from './game/InputController'

const input = InputController.create()

export default function App() {
    return (
        <View style={styles.container}
              onTouchStart={input.onTouchStart.bind(input)}
              onTouchMove={input.onTouchMove.bind(input)}
              onTouchEnd={input.onTouchEnd.bind(input)}
        >
            <StatusBar hidden={true} />
            <Canvas style={styles.canvas} ref={GameController.create(new GameScene(), input)} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ff0000',
        flex: 1,
    },
    canvas: {
        backgroundColor: '#93bfc9',
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0
    }
})

