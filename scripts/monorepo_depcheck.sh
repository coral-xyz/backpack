#!/bin/bash

# Use fd to find all package.json files in the packages directory
fd package.json packages | while read packageFile; do
	yarn depcheck "$(dirname "$packageFile")"
done
