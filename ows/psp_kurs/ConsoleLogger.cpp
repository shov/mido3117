#include "ConsoleLogger.h"

void ConsoleLogger::info(const string & msg) {
    std::cout << "Info: " << msg << std::endl;
}

void ConsoleLogger::error(const string & msg) {
    std::cerr << "Info: " << msg << std::endl;
}