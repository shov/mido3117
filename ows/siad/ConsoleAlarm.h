//
// Created by Alexandr Shevchenko on 11/4/20.
//

#ifndef SIAD_CONSOLEALARM_H
#define SIAD_CONSOLEALARM_H

#include "string"
#include "IAlarming.h"

using namespace std;

class ConsoleAlarm : public IAlarming {
public:
    void sendAlarm(string message) override;
};


#endif //SIAD_CONSOLEALARM_H
