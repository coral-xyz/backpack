#!/bin/bash

################################################################################
#
# Versions a given build by creating a typescript file that will be used in the
# app.
#
# Make sure to run this from the packages/app-extesnsion directory.
#
# Usage:
#
# ./scripts/version.sh <version>
#
################################################################################

set -euo pipefail

version=$1
out_file="./src/version.ts"

main () {
		if [ -f "./src/version.ts" ]; then
				rm ./src/version.ts
		fi

		cat <<EOF >"$out_file"
// This file is generated via a pre-build step via scripts/version.sh
export const VERSION = "${version}";
EOF
}

main
