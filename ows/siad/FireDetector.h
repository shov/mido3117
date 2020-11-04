//
// Created by Alexandr Shevchenko on 11/4/20.
//

#ifndef SIAD_FIREDETECTOR_H
#define SIAD_FIREDETECTOR_H

#include "IRechargeable.h"
#include "BatteryAAA.h"
#include "AirSip.h"
#include "IAlarming.h"

class FireDetector : IRechargeable {
public:
    FireDetector(int id);

    int getId();

    int getStatus();

    void setBattery(IBattery *battery) override;

    IBattery* removeBattery() override;

    void analyzeAir(AirSip* airSip);

    static FireDetector* build();

    ~ FireDetector();

private:
    //A hundred is supposed to be enough for the demo program
    static int registeredDetectors[100];

    const int COST_OF_ANALYZE = 5;
    const int COST_OF_ALARM = 10;
    const int THRESHOLD_SMOKE = 15;
    
    int id;
    enum STATUS {OK, NO_POWER};
    STATUS status;
    IAlarming* alarm;
    IBattery* power;
};


#endif //SIAD_FIREDETECTOR_H
