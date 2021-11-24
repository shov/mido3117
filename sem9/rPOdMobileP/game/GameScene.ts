import {GameController} from './GameController'
import {IGameScene, TGameRenderSubscriptionCallback, TGameUpdateSubscriptionCallback, TScaledSize} from './GameTypes'
import {Boat} from './entities/Boat'
import {Treat, treatTypeList} from './entities/Treat'

export class GameScene implements IGameScene {
    protected _game!: GameController
    protected _dimensions!: TScaledSize

    // TODO destruction of entity objects

    public async load(game: GameController) {
        this._game = game
        this._dimensions = game.dimensions

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
                ctx.font = '14px Arial'
                ctx.fillText(`SCORE ${score}`, game.dimensions.width / 2 - ((6 + String(score).length) / 2) * 8, 60)
                ctx.strokeText(`SCORE ${score}`, game.dimensions.width / 2 - ((6 + String(score).length) / 2) * 8, 60)
            }
            game.subscribeOnRender(scoreRender)
        }
    }
}
