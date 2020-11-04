//
// Created by Alexandr Shevchenko on 11/4/20.
//

#include <iostream>
#include "ConsoleAlarm.h"

using namespace std;

void ConsoleAlarm::sendAlarm(string message) {
    cout << "[alarm]: " << message << endl;
}