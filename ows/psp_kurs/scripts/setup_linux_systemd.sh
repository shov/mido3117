#!/usr/bin/env bash

# Call this script with sudo on the remote with sudo
# The client must be called by root user either

SCRIPT_PATH="$( cd "$(dirname "$0")" || exit 1 ; pwd -P )"
cd "$SCRIPT_PATH" || exit 1

if [[ "$1" == "rollback" ]]; then
  # Remove systemd daemon
  printf 'Rollback\n';
    systemctl stop mido_psp_kurs
    systemctl disable mido_psp_kurs
    rm /etc/systemd/system/mido_psp_kurs.service
    rm /etc/systemd/system/multi-user.target.wants/mido_psp_kurs.service
    rm /usr/lib/systemd/system/mido_psp_kurs.service
    rm /usr/lib/systemd/system/multi-user.target.wants/mido_psp_kurs.service
    systemctl daemon-reload
    systemctl reset-failed
  printf "Done\n"
  exit 0;
  fi;

# Setup systemd daemon
printf 'Setup\n';
  cd /home/shov || exit 1
  cp ./src/scripts/mido_psp_kurs.service /etc/systemd/system/ \
  && systemctl enable mido_psp_kurs \
  && systemctl start mido_psp_kurs
printf "Done\n"