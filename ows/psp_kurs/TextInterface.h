//
// Created by Alexandr Shevchenko on 6/28/21.
//

#ifndef PSP_KURS_TEXTINTERFACE_H
#define PSP_KURS_TEXTINTERFACE_H

#include "string"

using std::string;

class TextInterface {
public:
    // get string from the source
    virtual string* fetchFromSource(const string &srcDescriptor) = 0;

    // save the string to output
    virtual void saveForSource(const string &data, const string &srcDescriptor) = 0;
};


#endif //PSP_KURS_TEXTINTERFACE_H
