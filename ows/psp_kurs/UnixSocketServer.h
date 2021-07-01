#ifndef PSP_KURS_UNIXSOCKETSERVER_H
#define PSP_KURS_UNIXSOCKETSERVER_H

#include "IServer.h"
#include "string"
#include "vector"
#include <netdb.h>
#include <unistd.h>
#include <sys/un.h>
#include <utility>
#include "regex"

using std::string;

/**
 * Set up UNIX socket server, and listen for incoming commands
 * on a command the handler callback is called,
 *   passed with arguments
 *   the result is sent to the socket
 */
class UnixSocketServer : public IServer {
public:
    IServer *setHandler(std::function<void(string **, string &out)>) override;

    void startListening() override;

protected:
    static const char *SOCK_PATH;

    std::function<void(string **, string &out)> m_handler;

    void processClient(int clientSock);
};


#endif //PSP_KURS_UNIXSOCKETSERVER_H
