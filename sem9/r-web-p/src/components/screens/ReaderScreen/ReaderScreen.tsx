import React, {MutableRefObject, useState} from 'react'
import axios from 'axios'
import {v4 as uuid4} from 'uuid'
import st from './ReaderScreen.module.scss'
import Word from './Word'

const defaultRaw = `This lavish gift edition of J.R.R. Tolkien's classic features cover art, illustrations, and watercolor paintings by the artist Alan Lee. Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any farther than his pantry or cellar. 
But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep one day to whisk him away on an adventure. They have launched a plot to raid the treasure hoard guarded by Smaug the Magnificent, a large and very dangerous dragon. Bilbo reluctantly joins their quest, unaware that on his journey to the Lonely Mountain he will encounter both a magic ring and a frightening creature known as Gollum.  Written for J.R.R. Tolkien's own children, The Hobbit has sold many millions of copies worldwide and established itself as a modern classic.`

function ReaderScreen() {
    const [content, setContent] = useState(processRawContent(defaultRaw))
    // tmp
    const contentName = 'Hobbit desc'
    const contentDate = new Date().toDateString()
    const contentSrcLang = 'en'
    const clientLang = 'ru'

    const translate = async (wordDescriber: TWordDescriber) => {
        let translated = wordDescriber.translated

        // call API
        if(!translated) {
            try {

                const body = new URLSearchParams()
                body.append('text', wordDescriber.src!)

                const resp = await axios({
                    method: 'post',
                    url: 'https://translate.yandex.net/api/v1.5/tr.json/translate',
                    params: {
                        key: process.env.REACT_APP_YANDEX_T_KEY,
                        lang: `${contentSrcLang}-${clientLang}`,
                    },
                    headers: {'content-type': 'application/x-www-form-urlencoded'},
                    data: body,
                })

                // inject translated
                translated = resp.data.text.join(' ')

            } catch (e: any) {
                console.error(e.message)
            }
        }

        setContent(content.map(contentWord => {
            if(wordDescriber.id === contentWord.id) {
                return {...contentWord, translated, hasBubble: true}
            }
            return {...contentWord, hasBubble: false}
        }))
    }

    return (
        <div className={st.readerScreen}>
            <div className={st.textContainer}>
                <div className={st.infoLine}>{contentName} {contentDate} {contentSrcLang} -&gt; {clientLang}</div>
                {content.map((wordDescriber: TWordDescriber) => {
                    if(wordDescriber.isBreak) {
                        return <div key={wordDescriber.id} className={st.textBreak} />
                    }

                    return <Word key={wordDescriber.id} wordDescriber={wordDescriber} translate={translate}/>
                })}
            </div>
        </div>
    )
}

function processRawContent(rawContent: string): TWordDescriber[]  {
    let counter = 0
    return rawContent.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .reduce((acc: any[], line) => {
            const wordLine = line.split(/\s+/)
                .filter(w => w.length > 0)
                .map(word => {
                    return {
                        id: uuid4(),
                        order: counter++,
                        src: word,
                        hasBubble: false,
                    } as TWordDescriber
                })

            const breakLine: TWordDescriber =  {
                id: uuid4(),
                order: counter++,
                isBreak: true
            }
            return [...acc, ...wordLine, breakLine]
        }, [])
}

export default ReaderScreen
