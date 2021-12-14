import React from 'react'
import st from './Menu.module.scss'
import MenuFab from './MenuFab'



function Menu() {
    return (
        <div className={st.menu}>

            <MenuFab icon={'add'}  />
            <MenuFab icon={'logout'} last/>
        </div>
    )
}

export default Menu
