import {Asset} from 'expo-asset'

export class Resources {
    protected static picRegistry: {
        [name: string]: Asset,
    } = {}

    public static loadImage(name: string, ref: any): Asset {
        Resources.picRegistry[name] = Asset.fromModule(ref)
        return Resources.picRegistry[name]
    }

    public static pic(name: string): undefined | Asset {
        return Resources.picRegistry[name]
    }
}
