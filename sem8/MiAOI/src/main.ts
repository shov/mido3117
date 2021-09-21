'use strict'

import {EventBus} from 'EventBus'
import {Container} from 'Container'
import {ImageLoader} from 'ImageLoader'
import {ImageModifier} from './ImageModifier'
import {colourUtils} from './ColourUtils'
import {BrightChartControl} from './BrightChartControl'

// DI container
const container = new Container()
container.registerObject('bus', new EventBus())
container.registerObject('colourUtils', colourUtils)
container.register('BrightChartControl', BrightChartControl, ['colourUtils',])
container.register('ImageModifier', ImageModifier, ['bus', 'colourUtils', 'BrightChartControl'])
container.register('ImageLoader', ImageLoader, ['bus', 'ImageModifier',])

// Start
try {
    const bus = container.get('bus')
    bus.on('error', (msg: string) => {
        alert(msg)
    })

    container.get('ImageLoader')

} catch (e: any) {
    alert(e.message)
    console.log(e)
}



