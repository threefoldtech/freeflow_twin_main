cd /app
service nginx restart
redis-server /etc/redis/redis.conf &
sleep 2
pm2 start /app/apps/backend/dist/src/server.js --name="api" &
