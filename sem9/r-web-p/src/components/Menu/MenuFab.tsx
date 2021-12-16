import React from 'react'
import { Fab } from 'rmwc'
import st from './Menu.module.scss'

function MenuFab({last, ...props}: any) {
    const classList = [st.fab]
    if(last) {
        classList.push(st.last)
    }

    return (
        <Fab className={classList} mini {...props}/>
    )
}

export default MenuFab
