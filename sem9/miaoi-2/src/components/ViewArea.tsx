import React from 'react'
import st from './ViewArea.module.scss'

export function ViewArea({children}: { children: any }) {
    return (
        <div className={st.ViewArea}>
            {children}
        </div>
    )

}
