#!/bin/bash

################################################################################
#
# Pre build step for this package.
#
# Make sure to run this from the packages/common-public directory.
#
# Usage:
#
# ./scripts/config.sh
#
# Required ENV Variables:
#
# BACKPACK_CONFIG_LOG_LEVEL
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
// Config for @coral-xyz/common-public.
//
export const BACKPACK_CONFIG_LOG_LEVEL: "trace" | "debug" | "error" | "warning" | "info" = "${BACKPACK_CONFIG_LOG_LEVEL:=debug}";

EOF
}

main
