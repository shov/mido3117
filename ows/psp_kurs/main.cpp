#include "IText.h"
#include "FileDriver.h"
#include "SpaceRemover.h"
#include "UnixSocketServer.h"
#include "ConsoleLogger.h"
#include "SysLogger.h"

int main(int argc, char **argv) {

    bool fg = false;

    if (argc > 1 && strcmp("-fg", argv[1]) == 0) {
        fg = true;
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
