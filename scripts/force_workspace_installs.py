# A one time script that updates the package.json file to use the "workspace:*" value for local packages.
# Except for @coral-xyz/anchor that doesn't live in this workspace.
import json
import glob
from collections import OrderedDict

def process_file(file_path):
    try:
        with open(file_path, 'r') as file:
            # Load the file using an OrderedDict to preserve key order
            data = json.load(file, object_pairs_hook=OrderedDict)
    except json.JSONDecodeError as e:
        print(f"Error processing {file_path}: {e}")
        return

    modified = False

    for section in ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']:
        if section in data:
            for key, value in data[section].items():
                if key.startswith("@coral-xyz/") and key != "@coral-xyz/anchor" and value == "*":
                    data[section][key] = "workspace:*"
                    modified = True

    if modified:
        with open(file_path, 'w') as file:
            # Write the file with indent=4 to format JSON nicely
            json.dump(data, file, indent=2, separators=(',', ': '))

# Glob pattern to match 'packages/*/package.json'
package_files = glob.glob('packages/*/package.json')

for file_path in package_files:
    process_file(file_path)
