'use strict'

import {EventBus} from 'EventBus'
import {Container} from 'Container'
import {ImageLoader} from 'ImageLoader'

// DI container
const container = new Container()
container.registerObject('bus', new EventBus())
container.register('ImageLoader', ImageLoader)

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



