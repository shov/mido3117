#ifndef PSP_KURS_FILEDRIVER_H
#define PSP_KURS_FILEDRIVER_H

#include "TextInterface.h"

/**
 * A strategy of load/save text using regular files
 * srcDescriptor is a path to the incoming file
 * output to be written (erase/create) to the same path
 * but .out in the very end of the filename
 */
class FileDriver : public TextInterface {
public:
    string *fetchFromSource(const string &srcDescriptor) override;

    void saveForSource(const string &data, const string &srcDescriptor) override;

protected:
    static void lockFile(int fileDescriptor, short mode);

    static void unlockFile(int fileDescriptor);
};

#endif //PSP_KURS_FILEDRIVER_H
