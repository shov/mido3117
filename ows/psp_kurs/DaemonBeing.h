#ifndef PSP_KURS_DAEMONBEING_H
#define PSP_KURS_DAEMONBEING_H

#include "string"
#include "vector"
#include <netdb.h>
#include <unistd.h>
#include <sys/un.h>
#include <utility>

using std::string;

/**
 * Set up UNIX socket server, and listen for incoming commands
 * on a command the handler callback is called,
 *   passed with arguments
 *   the result is sent to the socket
 */
class DaemonBeing {
public:
    DaemonBeing *setHandler(std::function<void(const std::vector<string> &)>);

    void startListening();

protected:
    static const char *SOCK_PATH;

    std::function<void(const std::vector<string> &)> m_handler;

    void processClient(int clientSock);
};


#endif //PSP_KURS_DAEMONBEING_H
