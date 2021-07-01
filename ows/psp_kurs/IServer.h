#ifndef PSP_KURS_ISERVER_H
#define PSP_KURS_ISERVER_H

#include "string"
#include <functional>

using std::string;

class IServer {
public:
    virtual IServer *setHandler(std::function<void(string **, string &out)>) = 0;

    virtual void startListening() = 0;
};

#endif //PSP_KURS_ISERVER_H
