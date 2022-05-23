# twin_aydo

# Development setup

## Network

Create a docker network so internal communication is possible

```console
docker network create chatnet
```

## Spawner

Go to the Spawner

```console
cd apps/spawner
```

In the docker-compose.yaml you need to adjust 2 lines to make it work.

-   On line 11 there is a folder mapped to `/config`. Either map a folder to it or just comment it out when no config is neeeded.
-   0n line 24 you need to map some certifications. There is a `certs` folder included in this project, use these. `../certs`

Then run inside the `spawner` folder.

```console
docker-compose up
```

Use `-d` to detach the process.

## Chat containers

Go into dev folder

```console
cd ../docker/dev
```

Creation of appdata

```console
mkdir ./appdata
mkdir ./appdata/chats
mkdir ./appdata/user
cp ../avatar.jpg ./appdata/user/avatar-default
```

Add or edit instances for the chat application in the docker-compose file. There should be an example commented where `$3bot` can be replace with any 3bot name.

-   Make sure every user has his own `appdata` folder!
-   Make sure the container name end with '-chat'
-   If you don't want the staging login flow, remove the `ENVIRONMENT=developement` or change to `production`

Build the containers

```console
docker compose up
```

Use `-d` to detach the process.

## Hosts file

Add two rules to the hosts file, change `$3bot` to the configured 3bot name in the docker-compose file. Duplicate for every `chat` containter.

```console
sudo vim /etc/hosts
```

```
127.0.0.1 digitaltwin.jimbertesting.be
127.0.0.1 $3bot.digitaltwin.jimbertesting.be
```
