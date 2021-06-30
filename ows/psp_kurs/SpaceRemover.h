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

    /**
     * textSource is a strategy how to get and save the text
     */
    explicit SpaceRemover(TextInterface &textSource) : m_textSource{&textSource} {};

    /**
     * Remove max the given number of space characters and return how many of them have been removed
     * if replacesLimit < 0 it removes as many space characters it can find
     * the result to be persisted to a output based on source and a strategy given by construction
     */
    int run(const string &source, int replacesLimit = ALL);

protected:
    TextInterface *m_textSource;
};


#endif //PSP_KURS_SPACEREMOVER_H
