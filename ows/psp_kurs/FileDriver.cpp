#include "FileDriver.h"

extern int errno;

string *FileDriver::fetchFromSource(const string &srcDescriptor) {
    int fileDescriptor = open(srcDescriptor.c_str(), O_RDONLY);
    if (fileDescriptor < 0) {
        switch (errno) {
            case EACCES:
                throw std::runtime_error("Cannot open source as a file " + srcDescriptor
                                         + " you have no permissions!");
            default:
                throw std::runtime_error("Cannot open source as a file " + srcDescriptor
                                         + " details: "
                                         + strerror(errno) + " | "
                                         + std::to_string(errno));
        }
    }

    struct stat fileInfo{};
    fstat(fileDescriptor, &fileInfo);

    if (!S_ISREG(fileInfo.st_mode) && !S_ISLNK(fileInfo.st_mode)) {
        close(fileDescriptor);
        throw std::runtime_error("The path " + srcDescriptor
                                 + " leads not to a regular file, other options are not supported");
    }

    auto *result = new string;
    result->resize(fileInfo.st_size);

    //Locking
    try {
        this->lockFile(fileDescriptor, F_RDLCK);
    } catch (std::runtime_error &e) {
        int lockRrr = std::stoi(e.what());
        close(fileDescriptor);
        throw std::runtime_error("Cannot lock file for reading " + srcDescriptor
                                 + " details: " + strerror(lockRrr)
                                 + " | " + e.what());
    }

    // Read
    read(fileDescriptor, (char *) (result->data()), fileInfo.st_size);

    // Unlocking
    try {
        this->unlockFile(fileDescriptor);
    } catch (std::runtime_error &e) {
        int lockErr = std::stoi(e.what());
        close(fileDescriptor);
        throw std::runtime_error("Cannot unlock file " + srcDescriptor
                                 + " details: " + strerror(lockErr)
                                 + " | " + std::to_string(lockErr));
    }

    // Close
    close(fileDescriptor);

    return result;
}

void FileDriver::saveForSource(const string &data, const string &srcDescriptor) {
    string outFile = srcDescriptor + ".out";
    int fileDescriptor = open(outFile.c_str(), O_TRUNC | O_WRONLY | O_CREAT, 0666);
    if (fileDescriptor < 0) {
        switch (errno) {
            case EACCES:
                throw std::runtime_error("Cannot open output destination as a file " + outFile
                                         + " you have no permissions!");
            case EISDIR:
                throw std::runtime_error("Cannot open output destination as a file " + outFile
                                         + " it's a directory!");
            default:
                throw std::runtime_error("Cannot open output destination as a file " + outFile
                                         + " details: " + strerror(errno)
                                         + " | " + std::to_string(errno));
        }
    }

    //Locking
    try {
        FileDriver::lockFile(fileDescriptor, F_WRLCK);
    } catch (std::runtime_error &e) {
        int lockRrr = std::stoi(e.what());
        close(fileDescriptor);
        throw std::runtime_error("Cannot lock file " + outFile
                                 + " details: " + strerror(lockRrr)
                                 + " | " + e.what());
    }

    // Write
    write(fileDescriptor, data.data(), data.size());

    // Unlocking
    try {
        FileDriver::unlockFile(fileDescriptor);
    } catch (std::runtime_error &e) {
        int lockErr = std::stoi(e.what());
        close(fileDescriptor);
        throw std::runtime_error("Cannot unlock file " + outFile
                                 + " details: " + strerror(lockErr)
                                 + " | " + std::to_string(lockErr));
    }

    // Close
    close(fileDescriptor);
}

void FileDriver::lockFile(int fileDescriptor, short mode) {

    struct flock flockInfo{};
    flockInfo.l_type = mode;
    flockInfo.l_whence = SEEK_SET;
    flockInfo.l_start = 0;
    flockInfo.l_len = 0;
    flockInfo.l_pid = getpid();

    // set locking in blocking mode
    int gotFlockData = fcntl(fileDescriptor, F_SETLKW, &flockInfo);
    if (gotFlockData < 0) {
        throw std::runtime_error(std::to_string(errno));
    }
}

void FileDriver::unlockFile(int fileDescriptor) {
    struct flock flockInfo{};
    flockInfo.l_type = F_UNLCK;
    flockInfo.l_whence = SEEK_SET;
    flockInfo.l_start = 0;
    flockInfo.l_len = 0;
    flockInfo.l_pid = getpid();

    int gotFlockData = fcntl(fileDescriptor, F_SETLKW, &flockInfo);
    if (gotFlockData < 0) {
        throw std::runtime_error(std::to_string(errno));
    }
}
