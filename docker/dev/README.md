# Dev environment

## Digitaltwin spawner

- `clone https://github.com/threefoldtech/digitaltwin_spawner`
- `cd digitaltwin_spawner`
- Create certificates in ./certs
- `docker-compose up -d --build`

## hosts file

Add the following records to your hosts file

```
127.0.0.1  development.digitaltwin.jimbertesting.be
127.0.0.1  doublename.digitaltwin.jimbertesting.be
127.0.0.1  digitaltwin.jimbertesting.be
```

## Create the following folders

```
./dev/appdata/chats
./dev/appdata/user
```

## Run digitaltwin development docker (Linux)

```
docker network create chatnet
docker-compose up --build
```

## Building the entire docker to publish

Go inside the root of the project then execute the following command

```
docker build -t jimbersoftware/chat:yggdrasil . --no-cache
```

### Spin up other digitaltwins

```
docker run -d --name doublename-chat --network=chatnet --sysctl net.ipv6.conf.all.disable_ipv6=0 --cap-add=NET_ADMIN --device=/dev/net/tun -e USER_ID=doublename jimbersoftware/chat:yggdrasil
```
