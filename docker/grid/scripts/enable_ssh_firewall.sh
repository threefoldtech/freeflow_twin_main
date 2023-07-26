#!/bin/bash

# Check if ufw is installed
if ! command -v ufw &>/dev/null; then
  echo "UFW is not installed. Please install ufw before running this script."
  exit 1
fi

# Set the default policies for incoming and outgoing traffic
ufw default deny incoming
ufw default allow outgoing

# Allow incoming SSH traffic on port 22
ufw allow ssh

# Allow specific ports (3000) for incoming traffic
ufw allow 3001

# Limit the rate of incoming SSH connections to prevent brute-force attacks
ufw limit ssh

# Enable the firewall with the --force option to avoid user interaction
ufw --force enable

echo "Firewall is now enabled with specific rules for incoming and outgoing traffic."
