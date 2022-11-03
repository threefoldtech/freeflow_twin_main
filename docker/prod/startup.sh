#!/bin/bash

FILE=/appdata/yggdrasil.conf
if test -f "$FILE"; then
    echo "$FILE already exists."
    exec yggdrasil -useconffile $FILE -logto /var/log/yggdrasil/yggdrasil.log >> /var/log/yggdrasil/yggdrasil.log &
fi

redis-server /etc/redis/redis.conf &
cd /app/apps/backend/dist
node migrator/migrator.js

echo "Copying production config"
cp /usr/share/nginx/html/config/production.js /usr/share/nginx/html/config/config-def.js
echo "DONE"
