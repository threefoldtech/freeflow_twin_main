#/bin/bash

FILE=/appdata/yggdrasil.conf
if test -f "$FILE"; then
    echo "$FILE already exists."
    exec yggdrasil -useconffile $FILE -logto /var/log/yggdrasil/yggdrasil.log >> /var/log/yggdrasil/yggdrasil.log &
fi

redis-server --bind 0.0.0.0 --port 6379 --protected-mode no --loadmodule /redis-json/target/release/librejson.so --loadmodule /redis-search/bin/linux-x64-release/search/redisearch.so &
cd /app
ls
yarn
yarn run migrate
if [ $? -eq 0 ]
then
  yarn dev &
else
  echo "Migrations failed"
  mv /var/tmp/error-nginx.conf /etc/nginx/conf.d/default.conf
fi

mkdir -p /certs && wget -O /certs/privkey.pem https://keys.jimbertesting.be/live/digitaltwin-local.jimbertesting.be/privkey.pem && wget -O /certs/fullchain.pem https://keys.jimbertesting.be/live/digitaltwin-local.jimbertesting.be/fullchain.pem

nginx
tail -f /dev/null
