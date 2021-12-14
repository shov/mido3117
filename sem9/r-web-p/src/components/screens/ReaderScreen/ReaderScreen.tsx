import React, {useState} from 'react'
import st from './ReaderScreen.module.scss'
import Word from './Word'

const defaultRaw = `Po nieudanej próbie przechwycenia przepowiedni Lord Voldemort jest gotów uczynić wszystko, by zawładnąć światem czarodziejów. Organizuje tajemny zamach na swego przeciwnika, a narzędziem w jego ręku staje się jeden z uczniów. Czy jego plan się powiedzie?

Szósta część przygód Harryego Pottera przynosi cenne informacje o matce Voldemorta, jego dzieciństwie oraz początkach kariery młodego Toma Riddle'a, które rzucą nowe światło na sylwetkę głównego antagonisty Pottera. Na czym polega sekret nadprzyrodzonej mocy Czarnego Pana? Jaki jest cel tajemniczych i niebezpiecznych wypraw Dumbledore'a? I wreszcie, kto jest tytułowym Księciem Półkrwi i jaką misję ma on do spełnienia?

Nowe wydanie książki o najsłynniejszym czarodzieju świata różni się od poprzednich nie tylko okładką, ale i wnętrzem po raz pierwszy na początku każdego tomu pojawi się mapka
Po nieudanej próbie przechwycenia przepowiedni Lord Voldemort jest gotów uczynić wszystko, by zawładnąć światem czarodziejów. Organizuje tajemny zamach na swego przeciwnika, a narzędziem w jego ręku staje się jeden z uczniów. Czy jego plan się powiedzie?

Szósta część przygód Harryego Pottera przynosi cenne informacje o matce Voldemorta, jego dzieciństwie oraz początkach kariery młodego Toma Riddle'a, które rzucą nowe światło na sylwetkę głównego antagonisty Pottera. Na czym polega sekret nadprzyrodzonej mocy Czarnego Pana? Jaki jest cel tajemniczych i niebezpiecznych wypraw Dumbledore'a? I wreszcie, kto jest tytułowym Księciem Półkrwi i jaką misję ma on do spełnienia?

Nowe wydanie książki o najsłynniejszym czarodzieju świata różni się od poprzednich nie tylko okładką, ale i wnętrzem po raz pierwszy na początku każdego tomu pojawi się mapka`

function ReaderScreen() {
    const [rawContent, setRawContent] = useState(defaultRaw)

    function processRawContent(rawContent: string) {
        return rawContent.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0)
            .reduce((acc: any[], line) => {
                const wordLine = line.split(/\s+/)
                    .filter(w => w.length > 0)
                    .map(word => {
                        return <Word>{word}</Word>
                    })
                return [...acc, ...wordLine, <div className={st.textBreak}/>]
            }, [])
    }

    return (
        <div className={st.readerScreen}>
            <div className={st.textContainer}>
                {processRawContent(rawContent)}
            </div>
        </div>
    )
}

export default ReaderScreen
