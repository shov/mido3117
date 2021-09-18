'use strict'

import {EventBus} from 'EventBus'
import {Container} from 'Container'
import {ImageLoader} from 'ImageLoader'
import {ImageModifier} from './ImageModifier'

// DI container
const container = new Container()
container.registerObject('bus', new EventBus())
container.register('ImageModifier', ImageModifier, ['bus'])
container.register('ImageLoader', ImageLoader, ['bus', 'ImageModifier'])

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



