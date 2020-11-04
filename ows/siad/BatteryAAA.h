//
// Created by Alexandr Shevchenko on 11/4/20.
//

#ifndef SIAD_BATTERYAAA_H
#define SIAD_BATTERYAAA_H

#include "IBattery.h"
#include "IRechargeable.h"

class BatteryAAA : IBattery {
public:
    constexpr static const float VOLTAGE = 1.25;

    explicit BatteryAAA(int power);

    void registerDevice(IRechargeable *device) override;

    void clearDevice() override;

    void spendPower(int value) override;

    const float getVoltage() override;

    static BatteryAAA *buildForPowerLevel(int power);

    static void trashBattery(IBattery *battery);

private:
    int powerBank;
    IRechargeable *mountedTo;
};


#endif //SIAD_BATTERYAAA_H
