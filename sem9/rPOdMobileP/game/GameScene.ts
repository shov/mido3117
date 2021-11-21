import {GameController} from './GameController'
import {Platform} from './entities/Platform'
import {IGameScene} from './GameTypes'
import {ScaledSize} from 'react-native'
import {Composite} from 'matter-js'

export class GameScene implements IGameScene {
    protected _game!: GameController
    protected _dimensions!: ScaledSize

    public async load(game: GameController) {
        this._game = game
        this._dimensions = game.dimensions

        // Setup entities
        const platform = new Platform()
        await platform.init(this._dimensions, this._game.canvas, this._game.ctx)
        Composite.add(game.engine.world, platform.getDeclaredBodies())
        game.subscribeOnUpdate(platform)
        game.subscribeOnRender(platform)
    }
}
