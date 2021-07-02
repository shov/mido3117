#!/usr/bin/env bash

# Call this script with sudo on the remote with sudo

if [[ "$1" == "rollback" ]]; then
  printf 'Rollback\n';
  /etc/init.d/mido_psp_kurs stop
  rm /etc/init.d/mido_psp_kurs
  printf 'Done\n';
  exit 0;
  fi;

printf 'Setup\n';
cd /home/shov || exit 1
cp ./src/scripts/mido_psp_kurs /etc/init.d
chmod 775 /etc/init.d/mido_psp_kurs
/etc/init.d/mido_psp_kurs start
printf 'Done\n';