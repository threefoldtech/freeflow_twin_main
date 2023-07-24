#!/bin/bash
yggdrasil -useconffile /conf/yggdrasil.conf &
/app/ds/run-document-server.sh
