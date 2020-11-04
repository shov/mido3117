//
// Created by Alexandr Shevchenko on 11/4/20.
//

#include "BatteryAAA.h"

BatteryAAA::BatteryAAA(int power) {
    if (power < 0 || power > 100) {
        throw "Power of a battery is out of range, must be in [0..100]";
    }

    powerBank = power;
}

void BatteryAAA::spendPower(int value) {
    int diff = powerBank - value;
    if(diff < 0) {
        throw "Not enough power";
    }

    powerBank = diff;
}

const float BatteryAAA::getVoltage() {
    if(powerBank > 0) {
        return BatteryAAA::VOLTAGE;
    }

    return 0;
}

void BatteryAAA::registerDevice(IRechargeable * device) {
    if(mountedTo != nullptr) {
        throw "Already mounted";
    }

    mountedTo = device;
}

void BatteryAAA::clearDevice() {
    mountedTo = nullptr;
}

BatteryAAA * BatteryAAA::buildForPowerLevel(int power) {
    return new BatteryAAA(power);
}

void BatteryAAA::trashBattery(IBattery *battery) {
    delete battery;
}