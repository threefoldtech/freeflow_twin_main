#!/bin/bash

FILE=/appdata/yggdrasil.conf
if test -f "$FILE"; then
    echo "$FILE already exists."
    exec yggdrasil -useconffile $FILE -logto /var/log/yggdrasil/yggdrasil.log >> /var/log/yggdrasil/yggdrasil.log &
fi

cd /app/apps/backend/dist
node migrator/migrator.js

echo "Copying production config"
cat /usr/share/nginx/html/config/production.js
cp /usr/share/nginx/html/config/production.js /usr/share/nginx/html/config/config-def.js
echo "DONE"
exit
