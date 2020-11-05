//
// Created by Alexandr Shevchenko on 11/4/20.
//

#ifndef SIAD_IALARMING_H
#define SIAD_IALARMING_H

#include "string"

using namespace std;

class IAlarming {
public:
    virtual void sendAlarm(string message) = 0;
    virtual ~IAlarming(){};
};


#endif //SIAD_IALARMING_H
