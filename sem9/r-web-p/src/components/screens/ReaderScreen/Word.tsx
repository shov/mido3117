import React, {useRef} from 'react'

function Word({children, translate}: any) {
    const wordRef = useRef(null)
    return (
        <span ref={wordRef} onClick={async () => {
            await translate(children, wordRef)
        }}>{children}</span>
    )
}

export default Word
