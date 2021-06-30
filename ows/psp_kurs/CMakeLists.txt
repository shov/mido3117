cmake_minimum_required(VERSION 3.19)
project(psp_kurs)

set(CMAKE_CXX_STANDARD 14)

add_executable(psp_kurs main.cpp FileDriver.cpp SpaceRemover.cpp DaemonBeing.cpp)