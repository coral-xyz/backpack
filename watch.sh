#!/bin/bash

yarn build:extension

while true; do

inotifywait -e modify,create,delete -r ./src/ && \
yarn build:extension

done
