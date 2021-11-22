import {ScaledSize} from './GameTypes'

export class Dimensions {
    protected static _dimensions?: ScaledSize
    public static get(area: string): ScaledSize {
        // ignore that it always screen for now
        if(!Dimensions._dimensions) {
            throw new Error('Dimensions not ready!')
        }

        return Dimensions._dimensions!
    }

    public static set(screensize: ScaledSize) {
        Dimensions._dimensions = {
            ...screensize,
            width: screensize.width || screensize.WIDTH,
            height: screensize.height || screensize.HEIGHT,
        }

        if(screensize.scale || screensize.SCALE) {
            Dimensions._dimensions.scale = screensize.scale || screensize.SCALE
        }
    }
}
