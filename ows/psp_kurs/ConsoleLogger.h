#ifndef PSP_KURS_CONSOLELOGGER_H
#define PSP_KURS_CONSOLELOGGER_H

#include "ILogger.h"
#include "iostream"

class ConsoleLogger : public ILogger {
public:
    void info(const string &msg) override;

    void error(const string &msg) override;
};


#endif //PSP_KURS_CONSOLELOGGER_H
