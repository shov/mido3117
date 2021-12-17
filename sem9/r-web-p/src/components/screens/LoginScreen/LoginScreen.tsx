import React, {FormEvent, useState} from 'react'
import st from './LoginScreen.module.scss'
import {Button, SimpleDialog, TextField, Typography} from 'rmwc'


function LoginScreen() {
    const [isPopup, setIsPopup] = useState(false)
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
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
