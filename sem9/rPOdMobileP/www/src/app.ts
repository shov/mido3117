import {GameController} from './game/GameController'
import {GameScene} from './game/GameScene'
import {Dimensions} from './game/Dimensions'

document.addEventListener('deviceready', () => {
    const canvas: HTMLCanvasElement = document.getElementById('canvas')! as HTMLCanvasElement
    (window as any).plugins.screensize.get((o: any) => {
        Dimensions.set(o)
        GameController.create(new GameScene())(canvas)
    }, (o: any) => {
        throw new Error(`Can't get screen size! ${o.message || o}`)
    })

}, false)
