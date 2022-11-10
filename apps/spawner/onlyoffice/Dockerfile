FROM onlyoffice/documentserver

COPY startup.sh /startup.sh
COPY local.json /local.json

RUN mv -f /local.json /etc/onlyoffice/documentserver/local.json

RUN chmod +x /startup.sh

RUN apt-get install dirmngr
RUN mkdir -p /usr/local/apt-keys
RUN gpg --fetch-keys https://neilalexander.s3.dualstack.eu-west-2.amazonaws.com/deb/key.txt
RUN gpg --export 569130E8CA20FBC4CB3FDE555898470A764B32C9 | sudo tee /usr/local/apt-keys/yggdrasil-keyring.gpg > /dev/null
RUN echo 'deb [signed-by=/usr/local/apt-keys/yggdrasil-keyring.gpg] http://neilalexander.s3.dualstack.eu-west-2.amazonaws.com/deb/ debian yggdrasil' | sudo tee /etc/apt/sources.list.d/yggdrasil.list
RUN apt-get update
RUN apt-get install yggdrasil

RUN yggdrasil -genconf > /etc/yggdrasil.conf

RUN sed -i 's/Peers:\s\[\]/Peers: \[\n\ttcp:\/\/gent02.dev.grid.tf:9943\n\ttcp:\/\/gent02.test.grid.tf:9943\n\ttcp:\/\/gw307.vienna2.greenedgecloud.com:9943\n\ttcp:\/\/gw330.salzburg1.greenedgecloud.com:9943\n\ttcp:\/\/gw425.vienna2.greenedgecloud.com:9943\n\ttls:\/\/s2.i2pd.xyz:39575\n\ttls:\/\/ygg-ukr.incognet.io:8884\n\ttls:\/\/yggno.de:18227\n\ttls:\/\/fi1.servers.devices.cwinfo.net:61995\n\ttls:\/\/51.255.223.60:54232\n\t\]/g' /etc/yggdrasil.conf

ENTRYPOINT ["/startup.sh"]
