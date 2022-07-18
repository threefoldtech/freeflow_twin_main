FROM golang:alpine as builder

ENV DUMB_INIT_VERSION=1.2.2 \
    YGGDRASIL_VERSION=0.4.0

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


FROM ubuntu:20.04

ENV NODEJS_VERSION=16

RUN set -ex \
 && apt-get update -y && apt-get upgrade -y \
 && DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt-get install -y nginx curl musl-tools nano iputils-ping procps iproute2 imagemagick software-properties-common build-essential llvm cmake libclang1 libclang-dev cargo git wget

RUN curl https://packages.redis.io/gpg | apt-key add - \
 && echo "deb https://packages.redis.io/deb $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/redis.list \
 && apt-get update -y \
 && apt-get install -y redis

RUN git clone "https://github.com/RedisJSON/RedisJSON.git" /redis-json \
 && cd /redis-json \
 && cargo build --release

RUN git clone --recursive "https://github.com/RediSearch/RediSearch.git" /redis-search \
 && cd /redis-search \
 && make setup \
 && make build

COPY --from=builder /src/yggdrasil    /usr/bin/
COPY --from=builder /src/yggdrasilctl /usr/bin/
COPY --from=builder /tmp/dumb-init    /usr/bin/
RUN mkdir /var/log/yggdrasil

COPY ./docker/dev/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./docker/error/public /usr/share/nginx/error
COPY ./docker/error/error-nginx.conf /var/tmp/error-nginx.conf
RUN rm -f /etc/nginx/sites-enabled/default

RUN echo "https://deb.nodesource.com/setup_${NODEJS_VERSION}.x"
RUN curl -sL "https://deb.nodesource.com/setup_${NODEJS_VERSION}.x" | bash -
RUN apt-get install -y nodejs
RUN npm install --global yarn

COPY ./docker/dev/startup.sh /startup.sh
RUN chmod +x /startup.sh

RUN mkdir /appdata
RUN mkdir /appdata/user 
COPY ./docker/avatar.jpg /appdata/user/avatar-default
COPY ./docker/redis.conf /etc/redis/redis.conf

CMD /startup.sh
