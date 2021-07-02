#!/usr/bin/env bash

# The script handles no unexpected situation and keep quite positive
# it means before start it make sure that:
# - there is a remote shov@ubuntu-s-1vcpu-1gb-fra1-01 I have a correct ssh key for
# - over there are well installed unzip and g++
# - on the host zip is installed
# - all the permissions are ok

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