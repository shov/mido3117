#include "SysLogger.h"

SysLogger::SysLogger(const string& ident) {
    this->ident = ident;
}

void SysLogger::info(const string &msg) {
    openlog(this->ident.c_str(), LOG_PID, LOG_USER);
    syslog(LOG_INFO, "%s", msg.c_str());
    closelog();
}

void SysLogger::error(const string &msg) {
    openlog(this->ident.c_str(), LOG_PID, LOG_USER);
    syslog(LOG_ERR, "%s", msg.c_str());
    closelog();
}

