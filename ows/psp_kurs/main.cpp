#include "TextInterface.h"
#include "FileDriver.h"
#include "SpaceRemover.h"
#include "DaemonBeing.h"
#include "iostream"
#include "vector"

int main(int argc, char **argv) {
    try {
        //TODO move to client or else
        // the first version is based on app arguments, so replaceLimit and inputFile
        if (argc < 3) {
            throw std::runtime_error("Expected at least 2 arguments: filename and replace_limit");
        }

        const string fileName(argv[1]);
        const int replaceLimit = std::stoi(argv[2]);










        // Bind implementation of FileDriver to TextInterface
        FileDriver textOp;

        // Create SpaceRemover
        SpaceRemover remover(textOp);

        // Create the daemon
        DaemonBeing daemon{};

        // Set the handler and start listening
        daemon.setHandler([&remover](const std::vector<string> &params) -> void {
                    int removedRes = remover.run(params[0], std::stoi(params[1]));
                    std::cout << removedRes << " space characters have been removed!" << std::endl;
                })
                ->startListening();

    } catch (const std::exception &e) {
        std::cerr << e.what() << std::endl;
    } catch (...) {
        std::cerr << "Unexpected error occurred!" << std::endl;
    }
    return 0;
}
