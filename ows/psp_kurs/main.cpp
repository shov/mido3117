#include <unistd.h>
#include <cstdlib>
#include <stdexcept>
#include <sys/stat.h>
#include <sys/fcntl.h>
#include <cstring>
#include <string>

#include "IText.h"
#include "FileDriver.h"
#include "SpaceRemover.h"
#include "UnixSocketServer.h"
#include "ConsoleLogger.h"
#include "SysLogger.h"


using std::string;

void becomeDaemon();

int main(int argc, char **argv) {

    bool fg = false;

    if (argc > 1 && strcmp("-fg", argv[1]) == 0) {
        fg = true;
    }

    //Foreground / daemon
    if (!fg) {
        becomeDaemon();
    }


    //Bind the logger
    ILogger *p_logger = nullptr;
    SysLogger sysLogger("mido_psp_kurs");
    ConsoleLogger conLogger;

    if (fg) {
        p_logger = &conLogger;
    } else {
        p_logger = &sysLogger;
    }

    // Bind FileDriver as a source
    FileDriver fileDriver;
    IText *p_textSource = &fileDriver;

    // Bind UnixSocketServer as a server
    UnixSocketServer server(*p_logger);
    IServer *p_server = &server;

    //Start
    try {
        // Create SpaceRemover
        SpaceRemover remover(*p_textSource);

        // Set the handler and start listening
        // Callback runs business logic
        p_server
                ->setHandler([&remover, p_logger](string **params, string &out) -> void {
                    int removedRes = remover.run(*params[0], std::stoi(*params[1]));

                    p_logger->info(std::to_string(removedRes) + " space characters have been removed!");

                    out.append(std::to_string(removedRes));
                })
                ->startListening();

    } catch (const std::exception &e) {
        p_logger->error(e.what());
    } catch (...) {
        p_logger->error("Unexpected error occurred!");
    }

    return 0;
}

/**
 * Daemonization procedure
 * used "old-style" approach
 * @url https://man7.org/linux/man-pages/man7/daemon.7.html#DESCRIPTION
 */
void becomeDaemon() {
    int pid = fork();
    if (pid < 0) {
        throw std::runtime_error("Cannot fork");
    }

    //Exit for parent
    if (pid > 0) {
        exit(0);
    }

    setsid();

    // to ensure that the daemon
    // can never re-acquire a terminal again. (This relevant if the
    //     program — and all its dependencies — does not carefully
    // specify `O_NOCTTY` on each and every single `open()` call
    // that might potentially open a TTY device node.)
    int noTtyTrickPid = fork();
    if (noTtyTrickPid < 0) {
        throw std::runtime_error("Cannot fork for session group leader");
    }

    //Exit for parent again
    if (noTtyTrickPid > 0) {
        exit(0);
    }

    umask(0);

    chdir("/");

    close(STDIN_FILENO);
    close(STDOUT_FILENO);
    close(STDERR_FILENO);

    // The file descriptor returned by
    //   a successful call will be the lowest-numbered file descriptor not
    //   currently open for the process.
    // @url https://man7.org/linux/man-pages/man2/open.2.html#DESCRIPTION
    // hence they are 0, 1, 2 the same as stdin, out, err
    open("/dev/null", O_RDONLY);
    open("/dev/null", O_RDWR);
    open("/dev/null", O_RDWR);

    FILE *pidFileD;
    pidFileD = fopen("/var/run/mido_psp_kurs.pid", "w+");

    if(!pidFileD) {
        throw std::runtime_error("Cannot create/open PID file");
    }

    if(fprintf(pidFileD, "%u", getpid()) < 0) {
        fclose(pidFileD);
        throw std::runtime_error("Cannot update PID file");
    }

    fclose(pidFileD);
}