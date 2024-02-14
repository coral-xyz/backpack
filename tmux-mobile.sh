#!/bin/bash

# Create a new tmux session
tmux new-session -d -s backpack
tmux rename-window 'terminal'

# Split the window vertically
tmux split-window -v -p20
tmux split-window -h

# Run the user-specified command in the top left pane
tmux select-pane -t2
tmux send-keys "cd packages/app-mobile && yarn ios" C-m

tmux select-pane -t3
tmux send-keys "yarn start:mobile" C-m

tmux new-window -n 'workspace'
tmux select-window -t1 \; select-pane -t1 \; send-keys "tmux resize-pane -t1 -y 70" Enter

tmux attach-session -t backpack

# ----------------------------
# 90% viewport
# :q
#
# ----------------------------
# 10% viewport |
# app-mobile   | backpack root
# yarn ios     | yarn start:mobile
#              |
