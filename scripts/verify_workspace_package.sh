#!/bin/bash

# Flag to indicate if an error was found
error_found=0

# Function to check each file
check_file() {
    local file=$1
    local offending_lines=$(git diff --cached "$file" | grep '"@coral-xyz/[^"]*":\s*"\*"')
    if [ ! -z "$offending_lines" ]; then
        echo "Error in $file: Workspace dependencies should be installed with 'workspace:*' instead of '*' with yarn v4."
        echo "Offending lines:"
        echo "$offending_lines"
        return 1
    fi
}

# Loop through all modified package.json files
for file in $(git diff --cached --name-only | grep 'package.json$'); do
    check_file "$file"
    if [ $? -ne 0 ]; then
        error_found=1
    fi
done

# Exit with error if the pattern was found
if [ $error_found -ne 0 ]; then
    exit 1
fi
