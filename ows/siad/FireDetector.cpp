//
// Created by Alexandr Shevchenko on 11/4/20.
//
#include <iostream>
#include "string"
#include "FireDetector.h"
#include "ConsoleAlarm.h"

using namespace std;

ID_REPO FireDetector::registeredDetectors;

FireDetector::FireDetector(int id) {
    this->id = id;
    status = STATUS::NO_POWER;
    alarm = new ConsoleAlarm();
}

int FireDetector::getId() {
    return id;
}

FireDetector::STATUS FireDetector::getStatus() {
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
        throw (string("Cannot register battery in a device, it must be in another one, remove it first (") +
               string(message) + string(")")).c_str();
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
    //save the result and spend the sip
    int smokeLevel = airSip->getSmokeLevel();
    delete airSip;

    //check if we can analyze
    if (status != STATUS::OK) {
        return; //nothing is analyzed, device is off
    }

    if (power == nullptr) {
        status = NO_POWER;
        throw "Battery is invalid";
    }

    try {
        power->spendPower(COST_OF_ANALYZE);
    } catch (const char *message) {
        status = NO_POWER;
        return; //battery must be empty
    }

    //OK here we can analyze
    if (smokeLevel <= THRESHOLD_SMOKE) {
        return; //Air is ok
    }

    //Fire! try to alarm
    try {
        power->spendPower(COST_OF_ALARM);
    } catch (const char *message) {
        status = NO_POWER;
        return; //battery must be empty
    }

    char message[255];
    sprintf(message, "%d reports a Fire!", getId());
    alarm->sendAlarm(message);
}

FireDetector::~FireDetector() {
    if(nullptr != power) {
        IBattery *battery = removeBattery();
        delete battery;
    }
    delete alarm;
}

int FireDetector::idGenerator() {
    int result = rand() % 10000;

    bool found = false;
    size_t length = sizeof(FireDetector::registeredDetectors.ids) / sizeof(int);
    for (int i = 0; i < length; i++) {
        if (FireDetector::registeredDetectors.ids[i] == result) {
            found = true;
            break;
        }
    }

    if (found) {
        result = FireDetector::idGenerator();
    }

    return result;
}

FireDetector *FireDetector::build() {
    if (FireDetector::registeredDetectors.top >= FireDetector::registeredDetectors.max - 1) {
        throw "Cannot build, the repo is full";
    }

    int newId = FireDetector::idGenerator();
    auto *newInstance = new FireDetector(newId);
    FireDetector::registeredDetectors.ids[FireDetector::registeredDetectors.top] = newId;
    FireDetector::registeredDetectors.top++;

    return newInstance;
}