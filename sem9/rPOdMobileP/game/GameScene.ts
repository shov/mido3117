import {GameController} from './GameController'
import {Platform} from './entities/Platform'
import {IGameScene, TGameRenderSubscriptionCallback, TGameUpdateSubscriptionCallback} from './GameTypes'
import {ScaledSize} from 'react-native'
import {Composite, Composites} from 'matter-js'
import {Stone} from './entities/Stone'
import {Canon} from './entities/Canon'
import {Boat} from './entities/Boat'
import {Treat, treatTypeList} from './entities/Treat'
import Canvas from 'react-native-canvas'

export class GameScene implements IGameScene {
    protected _game!: GameController
    protected _dimensions!: ScaledSize

    // TODO destruction of entity objects

    public async load(game: GameController) {
        this._game = game
        this._dimensions = game.dimensions

        // PLATFORM
        // const platform = new Platform(this._dimensions, this._game.canvas, this._game.ctx)
        //
        // const w = (this._dimensions.width / 4) - ((this._dimensions.width / 4) % 32)
        // const h = 32
        // const x = game.dimensions.width - w / 2 - 200
        // const y = (game.dimensions.height / 4 * 2.5) - 2
        //
        // await platform.init(x, y, w, h)
        // Composite.add(game.engine.world, platform.getDeclaredBodies())
        // game.subscribeOnUpdate(platform)
        // game.subscribeOnRender(platform)

        // STONES
        // Composites.stack(600, 160, 3, 3, 32, 32, (x: number, y: number) => {
        //     const stone = new Stone(this._dimensions, this._game.canvas, this._game.ctx)
        //     stone.init(x, y).then(() => {
        //         Composite.add(game.engine.world, stone.getDeclaredBodies())
        //         game.subscribeOnUpdate(stone)
        //         game.subscribeOnRender(stone)
        //     })
        // })

        // CANNON
        // const canon = new Canon(this._dimensions, this._game.canvas, this._game.ctx)
        // await canon.init(200, 300, 32, 32, 200, 300)
        // Composite.add(game.engine.world, [...canon.getDeclaredBodies(), ...canon.getDeclaredConstraints()])
        // game.subscribeOnUpdate(canon)
        // game.subscribeOnRender(canon)

        // BOAT
        const boat = new Boat()
        await boat.init(
            this._game.canvas,
            game.dimensions.width / 2,
            game.dimensions.height - boat.shape.h! * 1.5,
            {
                right: game.dimensions.width,
                left: 0,
            }
        )
        game.subscribeOnUpdate(boat)
        game.subscribeOnRender(boat)

        // FISH LOOP
        {
            let score = 0

            const MAX_NEXT_TREAT = 3000
            const MAX_SAME_TIME_TREAT = 3
            let nexTime = Date.now() + MAX_NEXT_TREAT

            const zoneStep = game.dimensions.width / 9
            const zoneAreaList = {
                A: [Math.max(0, 40, zoneStep)],
                B: [zoneStep, zoneStep * 3],
                C: [zoneStep * 3, zoneStep * 6],
                D: [zoneStep * 6, zoneStep * 8],
                E: [zoneStep * 8, Math.max(zoneStep * 8, zoneStep * 9 - 40)],
            }
            type TZoneName = keyof (typeof zoneAreaList)

            const treatMap: Map<Treat, { toFree: boolean }> = new Map()

            const removeTreat = (treat: Treat) => {
                game.subscribeOnUpdate(treat)
                game.unsubscribeRender(treat)
                treatMap.delete(treat)
            }

            const sinkListener = (treat: Treat) => () => {
                const treatConf = treatMap.get(treat)
                if (!treatConf) return
                treatConf.toFree = true
            }

            const boatCollideListener = (treat: Treat) => () => {
                const treatConf = treatMap.get(treat)
                if (!treatConf) return
                score += treat.type.score
                console.log(`SCORE: ${score}`)
                treatConf.toFree = true
            }

            const fishLoop: TGameUpdateSubscriptionCallback = (_0, _1, delta: number) => {
                if (Date.now() < nexTime) {
                    return
                }

                //Emit treats
                const treatCount = (Math.round(Math.random() * 100) % MAX_SAME_TIME_TREAT) + 1

                for (let i = 0; i < treatCount; i++) {
                    const typeSeed = Math.random()
                    const type = treatTypeList.find(type => type.luckTest(typeSeed))
                    if (!type) {
                        continue // not lucky at all :D :D :D
                    }

                    const treat = new Treat(boat)

                    treat.onSink(sinkListener(treat))
                    treat.onBoatCollide(boatCollideListener(treat))
                    treatMap.set(treat, {toFree: false})

                    const zoneIndex = (Math.round(Math.random() * 100) % type.zones.length)
                    const z: TZoneName = type.zones[zoneIndex] as TZoneName

                    treat.init(
                        game.canvas,
                        Math.floor(Math.random() * (zoneAreaList[z][1] - zoneAreaList[z][0] + 1)) + zoneAreaList[z][0], // based on zone
                        treat.shape.y -= Math.random() * 50, // shuffle offsets
                        type)

                    game.subscribeOnUpdate(treat)
                    game.subscribeOnRender(treat)
                }

                for(let [treatKey, {toFree}] of treatMap.entries()) {
                    if(toFree) removeTreat(treatKey)
                }

                nexTime = Date.now() + MAX_NEXT_TREAT * Number(Math.random().toFixed(3))
            }
            game.subscribeOnUpdate(fishLoop)

            const scoreRender: TGameRenderSubscriptionCallback = (canvas, ctx) => {
                ctx.fillStyle = '#ffcf55'
                ctx.strokeStyle = '#0032b7'
                ctx.lineWidth = 0.5
                ctx.font = '24px Arial'
                ctx.fillText(`SCORE ${score}`, game.dimensions.width / 2 - ((6 + String(score).length) / 2) * 16, 60)
                ctx.strokeText(`SCORE ${score}`, game.dimensions.width / 2 - ((6 + String(score).length) / 2) * 16, 60)
            }
            game.subscribeOnRender(scoreRender)
        }
    }
}
