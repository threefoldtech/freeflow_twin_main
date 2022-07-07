#/bin/bash

FILE=/appdata/yggdrasil.conf
if test -f "$FILE"; then
    echo "$FILE already exists."
    exec yggdrasil -useconffile $FILE -logto /var/log/yggdrasil/yggdrasil.log >> /var/log/yggdrasil/yggdrasil.log &
fi

redis-server /etc/redis/redis.conf &
cd /app/apps/backend/dist
node migrator/migrator.js
if [ $? -eq 0 ]
then
  pm2 start src/server.js &
else
  echo "Migrations failed"
  mv /var/tmp/error-nginx.conf /etc/nginx/conf.d/default.conf
fi

if [ "$ENVIRONMENT" = 'production' ]
then
  echo "Copying production config"
  cp /usr/share/nginx/html/config/production.json /usr/share/nginx/html/config/config.json
fi
if [ "$ENVIRONMENT" = 'staging' ]
then
  echo "Copying staging config"
  cp /usr/share/nginx/html/config/staging.json /usr/share/nginx/html/config/config.json
fi

nginx
tail -f /dev/null
