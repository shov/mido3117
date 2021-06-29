#include "FileDriver.h"
#include "unistd.h"
#include "sys/stat.h"
#include "fcntl.h"
#include <cerrno>

extern errno_t errno;

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

    // Locking
    struct flock flockInfo{};
    flockInfo.l_type = F_RDLCK;
    flockInfo.l_whence = SEEK_SET;
    flockInfo.l_start = 0;
    flockInfo.l_len = 0;
    flockInfo.l_pid = getpid();

    // set locking in blocking mode
    int gotFlockData = fcntl(fileDescriptor, F_SETLKW, &flockInfo);
    if (gotFlockData < 0) {
        errno_t lockErr = errno;
        close(fileDescriptor);
        throw std::runtime_error("Cannot lock file for reading " + srcDescriptor
                                 + " details: " + strerror(lockErr)
                                 + " | " + std::to_string(lockErr));
    }

    // Read
    read(fileDescriptor, (char *) (result->data()), fileInfo.st_size);

    // Unlocking
    flockInfo.l_type = F_UNLCK;
    gotFlockData = fcntl(fileDescriptor, F_SETLKW, &flockInfo);
    if (gotFlockData < 0) {
        errno_t lockErr = errno;
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
    int fileDescriptor = open(outFile.c_str(), O_WRONLY | O_CREAT, 0666);
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

    // Locking
    struct flock flockInfo{};
    flockInfo.l_type = F_WRLCK;
    flockInfo.l_whence = SEEK_SET;
    flockInfo.l_start = 0;
    flockInfo.l_len = 0;
    flockInfo.l_pid = getpid();

    // set locking in blocking mode
    int gotFlockData = fcntl(fileDescriptor, F_SETLKW, &flockInfo);
    if (gotFlockData < 0) {
        errno_t lockErr = errno;
        close(fileDescriptor);
        throw std::runtime_error("Cannot lock file " + outFile
                                 + " details: " + strerror(lockErr)
                                 + " | " + std::to_string(lockErr));
    }

    // Write
    write(fileDescriptor, data.data(), data.size());

    // Unlocking
    flockInfo.l_type = F_UNLCK;
    gotFlockData = fcntl(fileDescriptor, F_SETLKW, &flockInfo);
    if (gotFlockData < 0) {
        errno_t lockErr = errno;
        close(fileDescriptor);
        throw std::runtime_error("Cannot unlock file " + outFile
                                 + " details: " + strerror(lockErr)
                                 + " | " + std::to_string(lockErr));
    }

    // Close
    close(fileDescriptor);
}
