#include "IText.h"
#include "FileDriver.h"
#include "SpaceRemover.h"
#include "UnixSocketServer.h"
#include "ConsoleLogger.h"

int main(int argc, char **argv) {

    //Bind ConsoleLogger as the logger
    ConsoleLogger logger;
    ILogger *p_logger = &logger;

    // Bind FileDriver as a source
    FileDriver fileDriver;
    IText *p_textSource = &fileDriver;

    // Bind UnixSocketServer as a server
    UnixSocketServer server;
    IServer *p_server = &server;

    try {
        //TODO move to client or else
        // the first version is based on app arguments, so replaceLimit and inputFile
        if (argc < 3) {
            throw std::runtime_error("Expected at least 2 arguments: filename and replace_limit");
        }

        const string fileName(argv[1]);
        const int replaceLimit = std::stoi(argv[2]);







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
