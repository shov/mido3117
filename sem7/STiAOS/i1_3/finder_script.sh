#!/bin/bash

# Usage: $ finder_script "string to search" /path/to/dir
# Print all full paths to files the string was found in and size of those files
# Recursive search for all the subdirectories
# In case some of the dirs cannot be read print a message

REFERENCE=$1
START_DIR=$2

if [ -z "$REFERENCE" ]; then
  echo "First argument must be not empty string!"
  exit 1
fi

if [ ! -d "$START_DIR" ] || [ ! -r "$START_DIR" ]; then
  echo "Second argument must be a path to a readable directory!"
  exit 1
fi

#Get a full path
START_DIR=$(cd "$START_DIR" && pwd)

echo "Looking for \"$REFERENCE\""
echo "in $START_DIR"

find_procedure() {
  for f in $1/*; do
    if [ -d "$f" ]; then
      if [ -r "$f" ]; then
        find_procedure "$f"
      else
        echo "Cannot read directory $f"
      fi
    else
      if [ -r "$f" ]; then
        if grep -q "$REFERENCE" "$f"; then
          echo "Found in:" $(ls "$f") $(ls -lah "$f" | awk '{ print $5 }')
        fi
      else
        echo "Cannot read a file $f"
      fi
    fi
  done
}

find_procedure "$START_DIR"
