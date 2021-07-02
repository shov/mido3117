#!/usr/bin/env bash

zip -r deploy.zip .
printf "ZIP\n"

scp ./deploy.zip shov@ubuntu-s-1vcpu-1gb-fra1-01:/home/shov
printf "Sent\n"

ssh shov@ubuntu-s-1vcpu-1gb-fra1-01 <<-'END_SSH_SESSION'
  cd /home/shov
  mkdir -p src
  unzip -o deploy.zip -d src
  cd ./src
  g++ -v main.cpp FileDriver.cpp SpaceRemover.cpp UnixSocketServer.cpp ConsoleLogger.cpp SysLogger.cpp -o ../app
  cd ..
END_SSH_SESSION
printf "Done\n"