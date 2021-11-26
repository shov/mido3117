import {GameController} from './GameController'
import {IGameScene, TGameRenderSubscriptionCallback, TGameUpdateSubscriptionCallback, TScaledSize} from './GameTypes'
import {Boat} from './entities/Boat'
import {Treat, treatTypeList} from './entities/Treat'
import {Ocean} from './entities/Ocean'
import {Sky} from './entities/Sky'

export class GameScene implements IGameScene {
    protected _game!: GameController
    protected _dimensions!: TScaledSize

    // TODO destruction of entity objects

    public loadingScreenRenderer(game: GameController) {
        game.ctx.clearRect(0, 0, game.dimensions.width, game.dimensions.height)
        game.ctx.fillStyle = '#77c4d5'
        game.ctx.fillRect(0, 0, game.dimensions.width, game.dimensions.height)
        game.ctx.fillStyle = '#ffcf55'
        game.ctx.strokeStyle = '#0032b7'
        game.ctx.lineWidth = 0.5
        game.ctx.font = '45px Arial'
        game.ctx.fillText('LOADING...', game.dimensions.width / 2 - 20 * 5, game.dimensions.height / 2 - 10)
        game.ctx.strokeText('LOADING...', game.dimensions.width / 2 - 20 * 5, game.dimensions.height / 2 - 10)
    }

    public async load(game: GameController) {
        this._game = game
        this._dimensions = game.dimensions

        // SKY
        const sky = new Sky(game.dimensions.width, game.dimensions.height)
        await sky.init(game.canvas)
        game.subscribeOnUpdate(sky)
        game.subscribeOnRender(sky)

        // BOAT
        const boat = new Boat()

        {
            // OCEAN WAVE 1
            const waveA = new Ocean(
                game.dimensions.height,
                game.dimensions.width,
                game.dimensions.height - boat.shape.h! * 1.5,
                1,
                '#5763b6'
            )
            await waveA.init(game.canvas, game.ctx)
            game.subscribeOnRender(waveA)
        }

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
                A: [Math.max(0, 80, zoneStep)],
                B: [zoneStep, zoneStep * 3],
                C: [zoneStep * 3, zoneStep * 6],
                D: [zoneStep * 6, zoneStep * 8],
                E: [zoneStep * 8, Math.max(zoneStep * 8, zoneStep * 9 - 80)],
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

                for (let [treatKey, {toFree}] of treatMap.entries()) {
                    if (toFree) removeTreat(treatKey)
                }

                nexTime = Date.now() + MAX_NEXT_TREAT * Number(Math.random().toFixed(3))
            }
            game.subscribeOnUpdate(fishLoop)

            const scoreRender: TGameRenderSubscriptionCallback = (canvas, ctx) => {
                ctx.fillStyle = '#ffcf55'
                ctx.strokeStyle = '#0032b7'
                ctx.lineWidth = 0.5
                ctx.font = '24px Arial'
                ctx.fillText(`SCORE ${score}`, game.dimensions.width / 2 - ((6 + String(score).length) / 2) * 18, 60)
                ctx.strokeText(`SCORE ${score}`, game.dimensions.width / 2 - ((6 + String(score).length) / 2) * 18, 60)
            }
            game.subscribeOnRender(scoreRender)
        }

        // OCEAN WAVE 2
        const waveB = new Ocean(
            game.dimensions.height,
            game.dimensions.width,
            game.dimensions.height - boat.shape.h! / 1.5,
            -0.5,
            '#32b5c5'
        )
        await waveB.init(game.canvas, game.ctx)
        game.subscribeOnRender(waveB, 'post')
    }
}
