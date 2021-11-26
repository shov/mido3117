import React from 'react'
import {StatusBar} from 'expo-status-bar'
import {StyleSheet, View} from 'react-native'
import Canvas from 'react-native-canvas'

import {GameController} from './game/GameController'
import {GameScene} from './game/GameScene'
import {InputController} from './game/InputController'
import {LinearGradient} from 'expo-linear-gradient'

const input = InputController.create()

export default function App() {
    return (
        <View style={styles.container}
              onTouchStart={input.onTouchStart.bind(input)}
              onTouchMove={input.onTouchMove.bind(input)}
              onTouchEnd={input.onTouchEnd.bind(input)}
        >
            <LinearGradient
                colors={['#93bfc9', '#77c4d5', '#42727e']}
                locations={[0, 0.7, 1]}
                style={{flex: 1}}
            >
                <StatusBar hidden={true} />
                <Canvas style={styles.canvas} ref={GameController.create(new GameScene(), input)} />
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#77c4d5',
        flex: 1,
    },
    canvas: {

        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0
    }
})

