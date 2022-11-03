#!/bin/bash

FILE=/appdata/yggdrasil.conf
if test -f "$FILE"; then
    echo "$FILE already exists."
    exec yggdrasil -useconffile $FILE -logto /var/log/yggdrasil/yggdrasil.log >> /var/log/yggdrasil/yggdrasil.log &
fi

REDIS_PASSWORD = jimber321123

sed -i `s/requirepass default/requirepass ${REDIS_PASSWORD}/g` /etc/redis/redis.conf
cat /etc/redis/redis.conf | grep requirepass | cut -d ' ' -f2 > /home/redis.password

redis-server /etc/redis/redis.conf &
cd /app/apps/backend/dist
node migrator/migrator.js

echo "Copying production config"
cp /usr/share/nginx/html/config/production.js /usr/share/nginx/html/config/config-def.js
echo "DONE"
