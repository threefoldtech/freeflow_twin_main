#!/bin/bash
yggdrasil -useconffile /etc/yggdrasil.conf &
/app/ds/run-document-server.sh
