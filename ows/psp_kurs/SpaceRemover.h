//
// Created by Alexandr Shevchenko on 6/28/21.
//

#ifndef PSP_KURS_SPACEREMOVER_H
#define PSP_KURS_SPACEREMOVER_H

#include "string"
#include "regex"
#include "TextInterface.h"

using std::string;

/**
 * Replaces spaces with nothing (remove those)
 * output to the textSource strategy
 */
class SpaceRemover {
public:
    // if less than zero, means replace all spaces
    static const int ALL = -1;

    // use text interface from DI
    explicit SpaceRemover(TextInterface &textSource) : m_textSource{&textSource} {};

    // remove max num of spaces, get this limit, input src and output desc (output can be fixed or based on input name)
    void run(const string &source, int replacesLimit = ALL);

protected:
    TextInterface *m_textSource;
};


#endif //PSP_KURS_SPACEREMOVER_H
