
#include "DaemonBeing.h"

const char *DaemonBeing::SOCK_PATH = "/tmp/mido_psp_kurs.sock";

DaemonBeing *DaemonBeing::setHandler(std::function<void(const std::vector<string> &)> handler) {
    this->m_handler = std::move(handler);
    return this;
}

void DaemonBeing::startListening() {

    int servSock, clientSock;
    socklen_t cliAddrLen;

    int backlog = 5; // max queue

    struct sockaddr_un servAddr{}, cliAddr{};
    memset(&servAddr, 0, sizeof(servAddr));
    memset(&cliAddr, 0, sizeof(cliAddr));

    int pid;

    servSock = socket(AF_UNIX, SOCK_STREAM, 0);

    if (servSock < 0) {
        throw std::runtime_error("Cannot open socket");
    }

    servAddr.sun_family = AF_UNIX;
    strcpy(servAddr.sun_path, DaemonBeing::SOCK_PATH);
    unlink(DaemonBeing::SOCK_PATH);

    if (bind(servSock, (struct sockaddr *) &servAddr, sizeof(servAddr)) < 0) {
        close(servSock);
        throw std::runtime_error("Cannot bind the socket");
    }

    if (listen(servSock, backlog) < 0) {
        close(servSock);
        throw std::runtime_error("Cannot start listening");
    }

    cliAddrLen = sizeof(cliAddr);

    while (true) {
        clientSock = accept(servSock, (struct sockaddr *) &cliAddr, &cliAddrLen);

        if (clientSock < 0) {
            close(servSock);
            close(clientSock);
            throw std::runtime_error("Cannot accept connection");
        }

        pid = fork();

        if (pid < 0) {
            close(servSock);
            close(clientSock);
            throw std::runtime_error("Forking has been failed");
        }

        // Client process
        if (pid == 0) {

            close(servSock);
            this->processClient(clientSock);
            close(clientSock);
            return;

            // Server process
        } else {
            close(clientSock);
        }

    } // while true
}

void DaemonBeing::processClient(int clientSock) {
    auto *params = new std::vector<string>;

    string buf;

    // todo use recv(2)
    if(read(clientSock, (char*)buf.data(), 256))

    // todo
    //   fetch a message from the socket
    //   split and push to the params
    //   send the response from the handler (add return value / pass a link)
    //   close socket
    params->push_back("xy.txt");
    params->push_back("2");

    this->m_handler(*params);
    delete params;
}
