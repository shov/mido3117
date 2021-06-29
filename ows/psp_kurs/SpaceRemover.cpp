//
// Created by Alexandr Shevchenko on 6/28/21.
//

#include "SpaceRemover.h"

/**
 * Replace spaces in string with nothing
 * if limit less than zero replace all
 * if 0 or greater, replace max times by the limit
 * save the result back to text source
 */
void SpaceRemover::run(const string &source, int replacesLimit) {
    // get the string, expected it's utf-8
    string* sourceStr = m_textSource->fetchFromSource(source);

    string resultStr = string();

    if(replacesLimit < 0) {
        // use regexp to replace all \s
        // return the result
    }

    if(replacesLimit == 0) {
        resultStr = *sourceStr;
    }

    if(replacesLimit > 0) {

        int replaceCounter = 0;

        // iterate thru the string
        // push every char to resultStr
        // if met \s and replaceCounter still <= replaceLimit
        //   skip pushing, increase replaceCounter
    }

    //todo remove
    resultStr = *sourceStr;
    resultStr += "⚙️ -> ";

    delete sourceStr;
    m_textSource->saveForSource(resultStr, source);
}
