#!/bin/bash

# Tracks package.json and makes sure `react-native` is a key in the relevant directories

# Directories to skip. IF IT'S USED BY THE MOBILE APP IT SHOULD NOT BE HERE
declare -A whitelist
whitelist["packages/ledger-injection"]=1
whitelist["packages/provider-injection"]=1
whitelist["packages/provider-core"]=1
whitelist["packages/secure-background"]=1
whitelist["packages/wallet-standard"]=1
whitelist["packages/token-lists"]=1
whitelist["packages/eslint-config-custom"]=1
whitelist["packages/eslint-config-custom/eslint-plugin-mui-custom"]=1
whitelist["packages/app-extension"]=1
whitelist["packages/xnft-cli"]=1

missing_key=false

# Search for package.json files directly under 'packages' and execute jq command
find packages -maxdepth 2 -mindepth 2 -name 'package.json' -print | while read -r filepath; do
	dir=$(dirname "$filepath")

	# Skip whitelisted directories
	if [[ -n "${whitelist["$dir"]}" ]]; then
		continue
	fi

	result=$(jq 'has("react-native")' "$filepath")

	# Only output directories that don't contain "react-native" key
	if [[ "$result" == "false" ]]; then
		echo "- $filepath"
		missing_key=true
	fi
done

if [[ "$missing_key" == "true" ]]; then
	echo "Make sure you add the react-native key to your package.json pointed to the src/index.{ts,tsx} file!"
	exit 1
fi
