//
// Created by Alexandr Shevchenko on 11/4/20.
//

#ifndef SIAD_IRECHARGEABLE_H
#define SIAD_IRECHARGEABLE_H

class IBattery;

class IRechargeable {
public:
    virtual void setBattery(IBattery *battery) = 0;

    virtual IBattery* removeBattery() = 0;
};

#endif //SIAD_IRECHARGEABLE_H
