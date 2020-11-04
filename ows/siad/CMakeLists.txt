cmake_minimum_required(VERSION 3.17)
project(siad)

set(CMAKE_CXX_STANDARD 14)

add_executable(siad main.cpp IAlarming.h IRechargeable.h IBattery.h ConsoleAlarm.cpp ConsoleAlarm.h BatteryAAA.cpp BatteryAAA.h FireDetector.cpp FireDetector.h AirSip.cpp AirSip.h)