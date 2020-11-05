#include <iostream>
#include "FireDetector.h"

string getDeviceStatus(FireDetector *device);

void listDevicesWithStatuses(vector<FireDetector *> *devices);

void sortDevices(vector<FireDetector *> *devices);

void stand(vector<FireDetector *> *devices);


int main() {
    std::cout << "Started, create 20 fire detectors" << std::endl;

    vector<FireDetector *> devices;

    devices.reserve(20);
    for (int i = 0; i < 20; i++) {
        devices.push_back(FireDetector::build());
    }

    listDevicesWithStatuses(&devices);
    sortDevices(&devices);
    listDevicesWithStatuses(&devices);
    try {
        stand(&devices);
    } catch (const char *e) {
        cout << "Fatal: " << e << endl;
    }

    //Free memory
    size_t length = devices.size();
    for (size_t i = 0; i < length; i++) {
        delete devices[i];
    }
}

/**
 * Sort devices by id
 * @param devices
 */
void sortDevices(vector<FireDetector *> *devices) {
    //Selection sort
    size_t length = devices->size();
    for (size_t i = 0; i < length; i++) {
        int minI = i;
        for (size_t j = i; j < length; j++) {
            int base = (*devices)[minI]->getId();
            int curr = (*devices)[j]->getId();

            if (curr < base) {
                minI = j;
            }
        }

        //swap
        FireDetector *currIVal = (*devices)[i];
        (*devices)[i] = (*devices)[minI];
        (*devices)[minI] = currIVal;
    }
}

/**
 * List devices
 * @param devices
 */
void listDevicesWithStatuses(vector<FireDetector *> *devices) {

    //listing
    cout << "List devices:" << endl;
    size_t length = devices->size();
    for (size_t i = 0; i < length; i++) {
        string detectedStatus = getDeviceStatus((*devices)[i]);
        printf("%05i: status: %s\n", (*devices)[i]->getId(), detectedStatus.c_str());
    }
}

/**
 * Get text representation of a device status
 * @param device
 * @return
 */
string getDeviceStatus(FireDetector *device) {
    string detectedStatus;
    FireDetector::STATUS status = (*device).getStatus();
    switch (status) {
        case FireDetector::STATUS::OK:
            detectedStatus = "OK";
            break;
        case FireDetector::STATUS::NO_POWER:
            detectedStatus = "NO POWER";
            break;
        default:
            throw "Unknown device status";
    }
    return detectedStatus;
}

/**
 * Stand, fire detector in action
 * @param devices
 */
void stand(vector<FireDetector *> *devices) {
    //Set 30% battery for first 5
    for (size_t i = 0; i < 5; i++) {
        BatteryAAA *battery = BatteryAAA::buildForPowerLevel(30);
        (*devices)[i]->setBattery(battery);
    }

    //Since
    //COST_OF_ANALYZE = 5;
    //COST_OF_ALARM = 10;
    // We expect that 30% battery can work for example clean air 2 times of analyze
    // and 1 time for smoked with an alarming, then 30 - 10 - 15 it's 5 left, we analyze once more but
    // power is exhausted and no alarm goes after.

    //Set 10% battery for next 5
    for (size_t i = 5; i < 10; i++) {
        BatteryAAA *battery = BatteryAAA::buildForPowerLevel(10);
        (*devices)[i]->setBattery(battery);
    }

    // We expect that 10% battery can work for as instance clean air 2 times of analyze
    // then 10 - 10
    // power left, no alarm.

    //Set 100% battery for next 5 and immediately remove
    for (size_t i = 10; i < 15; i++) {
        BatteryAAA *battery = BatteryAAA::buildForPowerLevel(100);
        (*devices)[i]->setBattery(battery);
    }
    for (size_t i = 10; i < 15; i++) {
        IBattery *battery = (*devices)[i]->removeBattery();
        BatteryAAA::trashBattery(battery);
    }

    //Devices with removed batteries cannot analyze either alarm
    //The rest of the devices are with no installed batteries so they are as well cannot do anything

    cout << "Batteries set" << endl;
    listDevicesWithStatuses(devices);

    //The test: 2 times clear air, then 2 times smoke of fire
    //THRESHOLD_SMOKE = 15
    for (int i = 0; i < 2; i++) {
        size_t length = devices->size();
        for (size_t j = 0; j < length; j++) {
            AirSip *air = AirSip::buildWithSmokeLevel(rand() % 10);
            printf("Device %05i: status: %s\n", (*devices)[j]->getId(), getDeviceStatus((*devices)[j]).c_str());
            printf("Device %05i: tries to analyze air\n", (*devices)[j]->getId());
            (*devices)[j]->analyzeAir(air);
            printf("Device %05i: status: %s\n", (*devices)[j]->getId(), getDeviceStatus((*devices)[j]).c_str());
        }
    }

    //2 times fire
    for (int i = 0; i < 2; i++) {
        size_t length = devices->size();
        for (size_t j = 0; j < length; j++) {
            AirSip *air = AirSip::buildWithSmokeLevel((rand() % 10) + 15);
            printf("Device %05i: status: %s\n", (*devices)[j]->getId(), getDeviceStatus((*devices)[j]).c_str());
            printf("Device %05i: tries to analyze air\n", (*devices)[j]->getId());
            (*devices)[j]->analyzeAir(air);
            printf("Device %05i: status: %s\n", (*devices)[j]->getId(), getDeviceStatus((*devices)[j]).c_str());
        }
    }
}