#ifndef PSP_KURS_ILOGGER_H
#define PSP_KURS_ILOGGER_H

#include "string"

using std::string;

class ILogger {
public:
    virtual void info(const string &msg) = 0;

    virtual void error(const string &msg) = 0;
};

#endif //PSP_KURS_ILOGGER_H
