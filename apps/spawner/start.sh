#!/bin/bash
tmux new-session \; split-window -h \; select-pane -t 0 \; \
  send-keys "cd ./frontend/ && yarn && yarn serve" ENTER \; select-pane -t 1 \; \
  send-keys "cd ./server/ && yarn && yarn serve" ENTER