#!/bin/bash

################################################################################
#
# Pre build step for this package.
#
# Make sure to run this from the packages/common directory.
#
# Usage:
#
# ./scripts/config.sh
#
# Required ENV Variables:
#
# BACKPACK_CONFIG_VERSION
# BACKPACK_FEATURE_LIGHT_MODE
# BACKPACK_FEATURE_POP_MODE
#
################################################################################

set -euo pipefail

out_file="./src/generated-config.ts"

main () {
		if [ -f "./src/generated-config.ts" ]; then
				rm ./src/generated-config.ts
		fi

		cat <<EOF >"$out_file"
////////////////////////////////////////////////////////////////////////////////
// This file is generated via a pre-build step via scripts/config.sh.
////////////////////////////////////////////////////////////////////////////////

//
// Config for @coral-xyz/common.
//
export const BACKPACK_CONFIG_VERSION: "development" | "production" | string = "${BACKPACK_CONFIG_VERSION:=development}";
export const BACKPACK_CONFIG_XNFT_PROXY: "development" | "production" = "${BACKPACK_CONFIG_XNFT_PROXY:=production}";
export const BACKPACK_FEATURE_LIGHT_MODE = ${BACKPACK_FEATURE_LIGHT_MODE:=true};
export const BACKPACK_FEATURE_POP_MODE = ${BACKPACK_FEATURE_POP_MODE:=true};
export const BACKPACK_FEATURE_USERNAMES = ${BACKPACK_FEATURE_USERNAMES:=false};
export const BACKPACK_FEATURE_XNFT = ${BACKPACK_FEATURE_XNFT:=true};

EOF
}

main
