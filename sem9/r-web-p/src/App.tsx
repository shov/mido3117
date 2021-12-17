import React from 'react'
import './App.scss'
import ReaderScreen from './components/screens/ReaderScreen/ReaderScreen'
import Menu from './components/Menu/Menu'
import LoginScreen from './components/screens/LoginScreen/LoginScreen'

function App() {
    return (
        <div className="App">
            {/*<Menu />*/}
            {/*<ReaderScreen />*/}
            <LoginScreen/>
        </div>
    )
}

export default App
