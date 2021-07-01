#include "SpaceRemover.h"

int SpaceRemover::run(const string &source, int replacesLimit) {
    // get the string, expected it's utf-8
    string* sourceStr = m_textSource->fetchFromSource(source);

    string resultStr;
    std::regex space("\\s");

    int replaceCounter = 0;

    if(replacesLimit == 0) {
        resultStr = *sourceStr;
    }

    if(replacesLimit != 0) {

        for(char const & c: *sourceStr) {
            string tmp;
            tmp.push_back(c);

            if(std::regex_match(tmp, space)) {
                if(replacesLimit == replaceCounter && replacesLimit > 0) {
                    resultStr.push_back(c);
                    continue;
                }

                replaceCounter++;
                continue;
            }

            resultStr.push_back(c);
        }

    }

    delete sourceStr;
    m_textSource->saveForSource(resultStr, source);
    return replaceCounter;
}
