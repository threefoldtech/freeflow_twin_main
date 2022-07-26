# DigitalTwin

## Install the following Dependencies

-   node/npm
-   yarn
-   tmux

## Running ./frontend (http://localhost:8080)

```
yarn install
yarn serve
```

## Running ./server (http://localhost:9000)

```
yarn install
yarn serve
```

## Alternatively (Will start a tmux session with everything u need attached to it.)

-   You can run ./start.sh to trigger it all.

-   chmod +x start.sh
-   ./start.sh

## Tmux config for clicking and copy-pasting

```
set -g default-terminal "screen-256color"
set -g mouse on
bind -n WheelUpPane if-shell -F -t = "#{mouse_any_flag}" "send-keys -M" "if -Ft= '#{pane_in_mode}' 'send-keys -M' 'select-pane -t=; copy-mode -e; send-keys -M'"
bind -n WheelDownPane select-pane -t= \; send-keys -M
bind -n C-WheelUpPane select-pane -t= \; copy-mode -e \; send-keys -M
bind -T copy-mode-vi    C-WheelUpPane   send-keys -X halfpage-up
bind -T copy-mode-vi    C-WheelDownPane send-keys -X halfpage-down
bind -T copy-mode-emacs C-WheelUpPane   send-keys -X halfpage-up
bind -T copy-mode-emacs C-WheelDownPane send-keys -X halfpage-down
unbind-key MouseDown2Pane
bind-key -n MouseDown2Pane run "tmux set-buffer \"$(xclip -o -sel clipboard)\"; tmux paste-buffer"
# To copy, left click and drag to highlight text in yellow,
# once you release left click yellow text will disappear and will automatically be available in clibboard
# # Use vim keybindings in copy mode
setw -g mode-keys vi
# Update default binding of Enter to also use copy-pipe
unbind -T copy-mode-vi Enter
bind-key -T copy-mode-vi Enter send-keys -X copy-pipe-and-cancel "xclip -selection c"
bind-key -T copy-mode-vi MouseDragEnd1Pane send-keys -X copy-pipe-and-cancel "xclip -in -selection clipboard"
```

Save under: ~/.tmux.conf

## Note

The development setup will setup the frontend and server. It will spawn the container name u entered as a threefold connect name, but not correctly redirect it.
This would require an nginx with reverse-proxy to be setup on your system or inside a docker. Which doesnt seem to be necessary for local development.
