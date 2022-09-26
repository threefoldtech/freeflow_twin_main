#!/bin/bash

mkdir -p ~/.ssh
mkdir -p /var/run/sshd
echo $SSH_KEY >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

tee -a /etc/resolv.conf << END
nameserver 2001:4860:4860::8888
nameserver 8.8.8.8
nameserver 1.1.1.1
END

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
cd /app

pm2 start apps/backend/dist/src/server.js &

nginx

service nginx restart

exec /usr/sbin/sshd -D
