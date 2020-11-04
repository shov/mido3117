//
// Created by Alexandr Shevchenko on 11/4/20.
//
#include "string"
#include "FireDetector.h"

using namespace std;

FireDetector::FireDetector(int id) {
    this->id = id;
    status = STATUS::NO_POWER;
}

int FireDetector::getId() {
    return id;
}

int FireDetector::getStatus() {
    return status;
}

void FireDetector::setBattery(IBattery *battery) {
    if (power != nullptr) {
        throw "Battery is already installed, remove it first!";
    }

    if (BatteryAAA::VOLTAGE != battery->getVoltage()) {
        throw "Wrong voltage, AAA Battery is only fits, perhaps it's empty";
    }

    try {
        battery->registerDevice(this);
    } catch (const char *message) {
        throw  (string("Cannot register battery in a device, it must be in another one, remove it first (") +  string(message) + string(")")).c_str();
    }

    power = battery;
    status = STATUS::OK;
}

IBattery *FireDetector::removeBattery() {
    IBattery *batteryPtr = power;
    batteryPtr->clearDevice();
    power = nullptr;
    status = NO_POWER;
    return batteryPtr;
}

void FireDetector::analyzeAir(AirSip *airSip) {

}