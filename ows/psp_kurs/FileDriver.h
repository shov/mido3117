//
// Created by Alexandr Shevchenko on 6/28/21.
//

#ifndef PSP_KURS_FILEDRIVER_H
#define PSP_KURS_FILEDRIVER_H

#include "TextInterface.h"


class FileDriver : public TextInterface {
    // implement interface
public:
    // read input file
    // lock on write
    string* fetchFromSource(const string &srcDescriptor) override;

    // save to output file
    // lock on write/read
    void saveForSource(const string &data, const string &srcDescriptor) override;
};

#endif //PSP_KURS_FILEDRIVER_H
