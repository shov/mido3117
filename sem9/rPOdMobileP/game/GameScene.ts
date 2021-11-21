import {GameController} from './GameController'
import {Platform} from './entities/Platform'
import {IGameScene} from './GameTypes'
import {ScaledSize} from 'react-native'
import {Composite, Composites} from 'matter-js'
import {Stone} from './entities/Stone'
import {Canon} from './entities/Canon'

export class GameScene implements IGameScene {
    protected _game!: GameController
    protected _dimensions!: ScaledSize

    public async load(game: GameController) {
        this._game = game
        this._dimensions = game.dimensions

        // PLATFORM
        const platform = new Platform(this._dimensions, this._game.canvas, this._game.ctx)

        const w = (this._dimensions.width / 4) - ((this._dimensions.width / 4) % 32)
        const h = 32
        const x = game.dimensions.width - w / 2 - 200
        const y = (game.dimensions.height / 4 * 2.5) - 2

        await platform.init(x, y, w, h)
        Composite.add(game.engine.world, platform.getDeclaredBodies())
        game.subscribeOnUpdate(platform)
        game.subscribeOnRender(platform)

        // STONES
        Composites.stack(600, 160, 3, 3, 32, 32, (x: number, y: number) => {
            const stone = new Stone(this._dimensions, this._game.canvas, this._game.ctx)
            stone.init(x, y).then(() => {
                Composite.add(game.engine.world, stone.getDeclaredBodies())
                game.subscribeOnUpdate(stone)
                game.subscribeOnRender(stone)
            })
        })

        // CANNON
        const canon = new Canon(this._dimensions, this._game.canvas, this._game.ctx)
        await canon.init(200, 300, 32, 32, 200, 300)
        Composite.add(game.engine.world, [...canon.getDeclaredBodies(), ...canon.getDeclaredConstraints()])
        game.subscribeOnUpdate(canon)
        game.subscribeOnRender(canon)
    }
}
