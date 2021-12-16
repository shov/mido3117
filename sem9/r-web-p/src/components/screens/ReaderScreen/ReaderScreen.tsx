import React, {MutableRefObject, useState} from 'react'
import axios from 'axios'
import {v4 as uuid4} from 'uuid'
import st from './ReaderScreen.module.scss'
import Word from './Word'

const defaultRaw = `Po nieudanej próbie przechwycenia przepowiedni Lord Voldemort jest gotów uczynić wszystko, by zawładnąć światem czarodziejów. Organizuje tajemny zamach na swego przeciwnika, a narzędziem w jego ręku staje się jeden z uczniów. Czy jego plan się powiedzie?

Szósta część przygód Harryego Pottera przynosi cenne informacje o matce Voldemorta, jego dzieciństwie oraz początkach kariery młodego Toma Riddle'a, które rzucą nowe światło na sylwetkę głównego antagonisty Pottera. Na czym polega sekret nadprzyrodzonej mocy Czarnego Pana? Jaki jest cel tajemniczych i niebezpiecznych wypraw Dumbledore'a? I wreszcie, kto jest tytułowym Księciem Półkrwi i jaką misję ma on do spełnienia?

Nowe wydanie książki o najsłynniejszym czarodzieju świata różni się od poprzednich nie tylko okładką, ale i wnętrzem po raz pierwszy na początku każdego tomu pojawi się mapka
Po nieudanej próbie przechwycenia przepowiedni Lord Voldemort jest gotów uczynić wszystko, by zawładnąć światem czarodziejów. Organizuje tajemny zamach na swego przeciwnika, a narzędziem w jego ręku staje się jeden z uczniów. Czy jego plan się powiedzie?

Szósta część przygód Harryego Pottera przynosi cenne informacje o matce Voldemorta, jego dzieciństwie oraz początkach kariery młodego Toma Riddle'a, które rzucą nowe światło na sylwetkę głównego antagonisty Pottera. Na czym polega sekret nadprzyrodzonej mocy Czarnego Pana? Jaki jest cel tajemniczych i niebezpiecznych wypraw Dumbledore'a? I wreszcie, kto jest tytułowym Księciem Półkrwi i jaką misję ma on do spełnienia?

Nowe wydanie książki o najsłynniejszym czarodzieju świata różni się od poprzednich nie tylko okładką, ale i wnętrzem po raz pierwszy na początku każdego tomu pojawi się mapka`

function ReaderScreen() {
    const [content, setContent] = useState(processRawContent(defaultRaw))
    // tmp
    const contentName = 'Harry POtter'
    const contentDate = new Date().toDateString()
    const contentSrcLang = 'pl'
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
