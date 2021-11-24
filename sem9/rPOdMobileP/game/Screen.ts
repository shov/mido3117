import {TScaledSize} from './GameTypes'
import {Dimensions} from 'react-native'

export class Screen {
    public static get() {
        if(!Screen._scaledSize) {
            const originScaledSize = Dimensions.get('screen')
            Screen._scaledSize = {
                origin: originScaledSize,
                width: originScaledSize.width / originScaledSize.scale,
                height: originScaledSize.height / originScaledSize.scale,
                scale: originScaledSize.scale,
            }
        }

        return Screen._scaledSize
    }

    protected static _scaledSize: TScaledSize
}
