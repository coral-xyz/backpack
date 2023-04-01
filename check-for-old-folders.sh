#!/bin/bash

# -d doesn't work on OSX, just on GNU-based tooling
# yesterday=$(date -d '1 day ago' +%Y-%m-%d)
if [[ "$(uname)" == "Darwin" ]]; then
  one_week_ago=$(date -v-1w +%Y-%m-%d)
  two_weeks_ago=$(date -v-2w +%Y-%m-%d)
else
  one_week_ago=$(date -d '1 weeks ago' +%Y-%m-%d)
  two_weeks_ago=$(date -d '2 weeks ago' +%Y-%m-%d)
fi

before=${1:-$one_week_ago}
after=${2:-$two_weeks_ago}

echo "checking for old scripts before:$before after:$after"

# Iterate through all the commits and find the ones that have the deploy: message
# The commits on this branch are different than master, which is why we're doing this!
commits=$(
   git log --pretty=format:"%s" --after="$after" --before="$before" \
   --grep="deploy:" | sed 's/deploy: //g' | cut -c1-7
 )

echo "$commits"

# Split the commits into an array, iterate through and delete older folders
IFS=$'\n' read -rd '' -a commits <<< "$commits"
for short_sha in "${commits[@]}"; do
  folder="background-scripts/$short_sha";
  if [ -d "$folder" ]; then
    echo "deleting: $short_sha"
    rm -rf "$folder";
    git add "$folder";
  fi
done

git commit -m "delete folders $before:$after"
git push
