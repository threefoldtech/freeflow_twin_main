#!/bin/bash

mkdir -p ~/.ssh
mkdir -p /var/run/sshd
chmod 600 ~/.ssh
chmod 600 /etc/ssh/*
echo $SSH_KEY >> ~/.ssh/authorized_keys