//
// Created by Alexandr Shevchenko on 11/4/20.
//

#ifndef SIAD_AIRSIP_H
#define SIAD_AIRSIP_H


class AirSip {
public:
    explicit AirSip(int smokeLevel);

    int getSmokeLevel();

    static AirSip *buildWithSmokeLevel(int smokeLevel);

private:
    int smokeLevel;
};


#endif //SIAD_AIRSIP_H
