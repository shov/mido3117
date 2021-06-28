//
// Created by Alexandr Shevchenko on 6/28/21.
//

#ifndef PSP_KURS_FILEDRIVER_H
#define PSP_KURS_FILEDRIVER_H

#include "TextInterface.h"


class FileDriver : TextInterface {
    // implement interface
public:
    // read input file
    // lock on write
    const string &fetchFromSource(const string& scrDescriptor);

    // save to output file
    // lock on write/read
    void save(const string &data);
};


#endif //PSP_KURS_FILEDRIVER_H
