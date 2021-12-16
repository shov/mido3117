import React from 'react'
import './App.scss'
import ReaderScreen from './components/screens/ReaderScreen/ReaderScreen'
import Menu from './components/Menu/Menu'

function App() {
    return (
        <div className="App">
            <Menu />
            <ReaderScreen />
        </div>
    )
}

export default App
