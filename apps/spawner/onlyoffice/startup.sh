#!/bin/bash
yggdrasil -useconffile /etc/yggdrasil.conf &

/app/ds/run-document-server.sh &
sleep 5s

sed -i 's/\"inbox\": true/\"inbox\":false/' /etc/onlyoffice/documentserver/local.json
sed -i 's/\"outbox\": true/\"outbox\":false/' /etc/onlyoffice/documentserver/local.json
sed -i 's/\"browser\": true/\"browser\":false/' /etc/onlyoffice/documentserver/local.json


tail -f /dev/null
