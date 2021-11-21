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

    public static readonly COLOR_GEM_LIST = {
        '0': '#8ec4ff',
        '1': '#cd75ff',
        '2': '#9f3970',
        '3': '#ff4a4a',
        '4': '#ff9b4a',
        '5': '#ffe14a',
        '6': '#bdff4a',
        '7': '#4cb634',
        '8': '#69fa9a',
        '9': '#3ffad8',
        '10':'#4a89ff',
    }
}
