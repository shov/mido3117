#ifndef PSP_KURS_SYSLOGGER_H
#define PSP_KURS_SYSLOGGER_H

#include "ILogger.h"
#include <sys/syslog.h>
#include "string"

using std::string;

class SysLogger : public ILogger {
public:
    explicit SysLogger(const string& ident);

    void info(const string &msg);

    void error(const string &msg);

protected:
    string ident;
};


#endif //PSP_KURS_SYSLOGGER_H
