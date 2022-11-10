FROM golang:alpine as yggdrasil_builder

ENV DUMB_INIT_VERSION=1.2.2 \
    YGGDRASIL_VERSION=0.4.4

RUN set -ex \
    && apk --no-cache add \
    build-base \
    curl \
    git \
    && git clone "https://github.com/yggdrasil-network/yggdrasil-go.git" /src \
    && cd /src \
    && git reset --hard v${YGGDRASIL_VERSION} \
    && ./build \
    && curl -sSfLo /tmp/dumb-init "https://github.com/Yelp/dumb-init/releases/download/v${DUMB_INIT_VERSION}/dumb-init_${DUMB_INIT_VERSION}_amd64" \
    && chmod 0755 /tmp/dumb-init

FROM node:16-alpine as builder
WORKDIR /app
COPY . .
RUN ls
RUN yarn
RUN yarn build


FROM ubuntu:20.04 as redis_builder
RUN apt-get update -y && apt-get upgrade -y \
 && DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt-get install -y curl software-properties-common build-essential llvm cmake libclang1 libclang-dev cargo git wget

RUN curl https://packages.redis.io/gpg | apt-key add - \
 && echo "deb https://packages.redis.io/deb $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/redis.list \
 && apt-get update -y \
 && apt-get install -y redis

RUN git clone "https://github.com/RedisJSON/RedisJSON.git" /redis-json \
 && cd /redis-json \
 && cargo fix --edition \
 && cargo build --release

RUN git clone -b v2.6.0 --recursive "https://github.com/RediSearch/RediSearch.git" /redis-search \
 && cd /redis-search \
 && make setup \
 && make build

FROM nginx:latest
ENV NODEJS_VERSION=16

RUN apt-get update -y && apt-get upgrade -y \
 && DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt-get install -y nginx curl musl-tools nano iputils-ping procps iproute2 imagemagick software-properties-common wget gnupg

RUN curl https://packages.redis.io/gpg | apt-key add - \
 && echo "deb https://packages.redis.io/deb $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/redis.list \
 && apt-get update -y \
 && apt-get install -y redis

COPY --from=yggdrasil_builder /src/yggdrasil    /usr/bin/
COPY --from=yggdrasil_builder /src/yggdrasilctl /usr/bin/
COPY --from=yggdrasil_builder /tmp/dumb-init    /usr/bin/
RUN mkdir /var/log/yggdrasil

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY ./docker/error/public /usr/share/nginx/error
COPY ./docker/error/error-nginx.conf /var/tmp/error-nginx.conf
COPY ./docker/prod/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app /app
COPY --from=redis_builder /redis-json /redis-json
COPY --from=redis_builder /redis-search /redis-search

RUN curl -sL "https://deb.nodesource.com/setup_${NODEJS_VERSION}.x" | bash -
RUN apt-get install -y nodejs
RUN npm install pm2 -g

COPY ./docker/prod/startup.sh /startup.sh
RUN chmod +x /startup.sh

RUN mkdir /appdata
RUN mkdir /appdata/user 
COPY ./docker/avatar.jpg /appdata/user/avatar-default
COPY ./docker/redis-example.conf /etc/redis/redis.conf

ENV NODE_ENV=staging

CMD /startup.sh
