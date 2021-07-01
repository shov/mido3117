#include "SysLogger.h"

SysLogger::SysLogger(const string& ident) {
    this->ident = (char *) ident.c_str();
}

void SysLogger::info(const string &msg) {
    openlog(this->ident, LOG_PID, LOG_USER);
    syslog(LOG_INFO, "%s", msg.c_str());
    closelog();
}

void SysLogger::error(const string &msg) {
    openlog(this->ident, LOG_PID, LOG_USER);
    syslog(LOG_ERR, "%s", msg.c_str());
    closelog();
}

