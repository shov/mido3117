//
// Created by Alexandr Shevchenko on 11/4/20.
//

#ifndef SIAD_FIREDETECTOR_H
#define SIAD_FIREDETECTOR_H

#include <vector>
#include "IRechargeable.h"
#include "BatteryAAA.h"
#include "AirSip.h"
#include "IAlarming.h"

typedef struct ID_REPO {
    int ids[100]{};
    int top = 0;
    const int max = 100;
} ID_REPO;

class FireDetector : public IRechargeable {
public:
    enum STATUS {
        OK, NO_POWER
    };

    FireDetector(int id);

    int getId();

    STATUS getStatus();

    void setBattery(IBattery *battery) override;

    IBattery *removeBattery() override;

    void analyzeAir(AirSip *airSip);

    ~FireDetector();

    static FireDetector *build();

private:
    //A hundred is supposed to be enough for the demo program
    static ID_REPO registeredDetectors;

    const int COST_OF_ANALYZE = 5;
    const int COST_OF_ALARM = 10;
    const int THRESHOLD_SMOKE = 15;

    int id;
    STATUS status;
    IAlarming *alarm;
    IBattery *power;

    static int idGenerator();
};


#endif //SIAD_FIREDETECTOR_H
