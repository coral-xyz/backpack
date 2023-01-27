#!/bin/bash

one_week_ago=$(date -v-1w +%Y-%m-%d)
two_weeks_ago=$(date -v-2w +%Y-%m-%d)

before=$one_week_ago
after=$two_weeks_ago

# Iterate through all the commits and find the ones that have the deploy: message
# The commits on this branch are different than master, which is why we're doing this!
commits=$(
   git log --pretty=format:"%s" --after="$after" --before="$before" \
   --grep="deploy:" | sed 's/deploy: //g' | cut -c1-8
 )

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
