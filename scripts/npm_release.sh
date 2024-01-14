#!/bin/bash

################################################################################
# Simple script to update the package.json version numbers for release in CI.
#
# Make sure to run this in the repo root directory.
#
# Usage:
#
# ./scripts/npm_release <version>
#
################################################################################

set -e

if [ $# -eq 0 ]; then
    echo "Usage $0 VERSION"
    exit 1
fi

version=$1

main () {
    update_package packages/common/
    update_package packages/xnft-cli/
}

update_package () {
    local package=$1
    pushd $package
    sed -i "s/\"version\": \".*\"/\"version\": \"${version}\"/g" package.json
    popd
}

main
