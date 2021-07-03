#include "UnixSocketServer.h"

const char *UnixSocketServer::SOCK_PATH = "/tmp/mido_psp_kurs.sock";

IServer *UnixSocketServer::setHandler(std::function<void(string**, string &out)> handler) {
    this->m_handler = std::move(handler);
    return this;
}

void UnixSocketServer::startListening() {

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
    strcpy(servAddr.sun_path, UnixSocketServer::SOCK_PATH);
    unlink(UnixSocketServer::SOCK_PATH);

    if (bind(servSock, (struct sockaddr *) &servAddr, sizeof(servAddr)) < 0) {
        close(servSock);
        throw std::runtime_error("Cannot bind the socket");
    }

    if (listen(servSock, backlog) < 0) {
        close(servSock);
        throw std::runtime_error("Cannot start listening");
    }

    cliAddrLen = sizeof(cliAddr);

    //Listening till the app's killed
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
            try {
                this->processClient(clientSock);
            } catch (...) {
                close(clientSock);
                throw;
            }
            return;

            // Server process
        } else {
            close(clientSock);
        }

    } // while true
}

void UnixSocketServer::processClient(int clientSock) {
    // the simple serving, only read a three words
    // first one is the expected only allowed command REMSP = remove spaces
    // sec is file path
    // third is number of replacements, expected integer numeric
    // max message length is 256 chars, if reached without meeting
    // the expectations throws error
    // to make sure the third argument is not corrupted an end symbol is \n if not met,
    // an error is throwing

    string* params[2];

    int BUF_LEN = 256;
    char buf[BUF_LEN];
    memset(buf, 0, BUF_LEN);

    ssize_t recLen = recv(clientSock, (char *) buf, BUF_LEN, 0);
    if (recLen < 0) {
        throw std::runtime_error("Cannot read from socket!");
    }

    if (recLen == 0) {
        throw std::runtime_error("0 body have been read for the socket!");
    }

    std::string body(buf);
    std::regex matrix(R"(^RESP ([^\s]+) (-?[0-9]+)\n)");
    std::smatch matches;

    if (!std::regex_search(body, matches, matrix)) {
        throw std::runtime_error("Unknown command or wrong arguments! "
                                 "expected: RESP <filePath> <limit> "
                                 "got: " + body);
    }

    string sourceParam = matches[1].str();
    string limitParam = matches[2].str();
    params[0] = &sourceParam;
    params[1] = &limitParam;

    string out;
    this->m_handler(params, out);

    // add termination char
    out.push_back('\n');
    if (strlen(out.data()) > BUF_LEN) {
        throw std::runtime_error("The response body is too long!");
    }

    memset(buf, 0, BUF_LEN);
    strcpy(buf, out.data());

    ssize_t sentLen = send(clientSock, buf, strlen(buf), 0);
    if (sentLen < 0) {
        throw std::runtime_error("Cannot send the response back to socket!");
    }
}
