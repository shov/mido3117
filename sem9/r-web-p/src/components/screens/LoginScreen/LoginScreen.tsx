import React, {FormEvent, useContext, useState} from 'react'
import st from './LoginScreen.module.scss'
import {Button, SimpleDialog, TextField, Typography} from 'rmwc'
import {AuthContext} from '../../../AuthContext'

function LoginScreen() {
    const {isAuth, setAuth} = (useContext(AuthContext) as unknown) as {isAuth: boolean, setAuth: any}
    const [isPopup, setIsPopup] = useState(false)
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        // call the server if true set Auth true, put token to the storage
        setIsPopup(true)
    }
    return (
        <div className={st.loginScreen}>
            <SimpleDialog
                title="👮"
                body="Wrong credentials, try again!"
                open={isPopup}
                onClose={_ => {
                    setIsPopup(false);
                }}
                cancelLabel={null}
                acceptLabel={'OK'}
            />
            <div className={st.authForm}>
                <Typography className={st.headLine} use="headline5">Hi 🙋 Please, fill in your creds:</Typography>
                <form action="" onSubmit={submit}>
                    <TextField outlined pattern={'[A-Za-z0-9]{3,30}'} required label={'user name'}/>
                    <TextField outlined  required type={'password'} label={'password'}/>
                    <Button raised>Log in</Button>
                </form>
            </div>
        </div>
    )
}

export default LoginScreen
