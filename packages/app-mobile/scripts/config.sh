#!/bin/bash
# Get the commit hash of the last commit and cut it down to 5 characters
COMMIT_HASH=$(git rev-parse HEAD | cut -c1-7)
export COMMIT_HASH
