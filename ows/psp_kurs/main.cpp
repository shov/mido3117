#include "TextInterface.h"
#include "FileDriver.h"
#include "SpaceRemover.h"
#include "iostream"

int main(int argc, char **argv) {
    try {
        // the first version is based on app arguments, so replaceLimit and inputFile
        if (argc < 3) {
            throw std::runtime_error("Expected at least 2 arguments: filename and replace_limit");
        }

        const string fileName(argv[1]);
        const int replaceLimit = std::stoi(argv[2]);

        // bind implementation of FileDriver to TextInterface
        FileDriver textOp;

        // create SpaceRemover
        SpaceRemover remover(textOp);

        //the first version of the app is to be terminated after one run
        int removedRes = remover.run(fileName, replaceLimit);

        std::cout << removedRes << " space characters have been removed!" << std::endl;

    } catch (const std::exception &e) {
        std::cerr << e.what() << std::endl;
    } catch (...) {
        std::cerr << "Unexpected error occurred!" << std::endl;
    }
    return 0;
}
