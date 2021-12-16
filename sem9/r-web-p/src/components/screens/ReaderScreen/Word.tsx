import React, {useRef} from 'react'
import st from './ReaderScreen.module.scss'
export type TWordProps = {wordDescriber: TWordDescriber, translate: any}

function Word({wordDescriber, translate}: TWordProps) {
    return (
        <span onClick={async () => {
            await translate(wordDescriber)
        }}>
            {wordDescriber.src!}
            {(() => {
                if(wordDescriber.hasBubble) {
                    return <div className={st.wordBubble}>{wordDescriber.translated}</div>
                }
            })()}
        </span>
    )
}

export default Word
