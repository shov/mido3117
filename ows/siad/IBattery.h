//
// Created by Alexandr Shevchenko on 11/4/20.
//

#ifndef SIAD_IBATTERY_H
#define SIAD_IBATTERY_H

#include "./IRechargeable.h"

class IBattery {
public:
    virtual void registerDevice(IRechargeable *) = 0;

    virtual void clearDevice() = 0;

    virtual void spendPower(int value) = 0;

    virtual const float getVoltage() = 0;
};

#endif //SIAD_IBATTERY_H
