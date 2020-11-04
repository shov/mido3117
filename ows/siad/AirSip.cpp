//
// Created by Alexandr Shevchenko on 11/4/20.
//

#include "AirSip.h"

AirSip::AirSip(int smokeLevel) : smokeLevel(smokeLevel) {}

int AirSip::getSmokeLevel() {
    return smokeLevel;
}

AirSip * AirSip::buildWithSmokeLevel(int smokeLevel) {
    return new AirSip(smokeLevel);
}