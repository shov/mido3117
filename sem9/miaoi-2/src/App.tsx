import React, {useEffect, useRef, useState} from 'react'
import './App.scss'
import {Menu} from './components/Menu'
import {ViewArea} from './components/ViewArea'
import {ImageView} from './components/ImageView'

function App() {
    const [srcImage, setSrcImage] = useState('')
    const [destImage, setDestImage] = useState('')
    const [destLabel, setDestLabel] = useState('No result yet, upload image and click on a filer')

    return (
        <div className="App">
            <Menu
                uploadDoneWith={setSrcImage}
                convertInterface={() => ({
                    setDestImage,
                    srcImage,
                    setLabel: setDestLabel,
                })}
            />
            <ViewArea>
                <ImageView label={'Original'} imgData={srcImage} />
                <ImageView label={destLabel} imgData={destImage} />
            </ViewArea>
        </div>
    )
}

export default App
