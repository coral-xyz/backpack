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
# ./scripts/config.sh
#
# Required ENV Variables:
#
# BACKPACK_CONFIG_VERSION
# BACKPACK_CONFIG_LOG_LEVEL
# BACKPACK_FEATURE_LIGHT_MODE
# BACKPACK_FEATURE_POP_MODE
#
################################################################################

set -euo pipefail

out_file="./src/generated-config.ts"

main () {
		if [ -f "./src/generated-config.ts" ]; then
				rm ./src/config.ts
		fi

		cat <<EOF >"$out_file"
////////////////////////////////////////////////////////////////////////////////
// This file is generated via a pre-build step via scripts/config.sh.
////////////////////////////////////////////////////////////////////////////////

//
// Config for @coral-xyz/common.
//
export const privateConfig = {
  BACKPACK_CONFIG_VERSION: "${BACKPACK_CONFIG_VERSION:=development}",
  BACKPACK_FEATURE_LIGHT_MODE: ${BACKPACK_FEATURE_LIGHT_MODE:=true},
  BACKPACK_FEATURE_POP_MODE: ${BACKPACK_FEATURE_POP_MODE:=true},
};

//
// Config for @coral-xyz/common-public.
//
export const publicConfig = {
  BACKPACK_CONFIG_LOG_LEVEL: "${BACKPACK_CONFIG_LOG_LEVEL:=debug}",
};
EOF
}

main
