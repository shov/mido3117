import React, {useMemo, useState} from 'react'
import './App.scss'
import ReaderScreen from './components/screens/ReaderScreen/ReaderScreen'
import Menu from './components/Menu/Menu'
import LoginScreen from './components/screens/LoginScreen/LoginScreen'
import { AuthContext } from './AuthContext'


function App() {
    const [isAuth, setAuth] = useState(false)
    const authValue = useMemo(
        () => ({ isAuth, setAuth }),
        [isAuth]
    )

    return (
        // @ts-ignore
        <AuthContext.Provider value={authValue}>
            <div className="App">
                <Menu />
                <ReaderScreen />
                {/*<LoginScreen />*/}
            </div>
        </AuthContext.Provider>
    )
}

export default App
