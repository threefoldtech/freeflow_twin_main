FROM onlyoffice/documentserver

COPY yggdrasil.conf /etc/yggdrasil.conf
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

RUN apt-get install dirmngr
RUN mkdir -p /usr/local/apt-keys
RUN gpg --fetch-keys https://neilalexander.s3.dualstack.eu-west-2.amazonaws.com/deb/key.txt
RUN gpg --export 569130E8CA20FBC4CB3FDE555898470A764B32C9 | sudo tee /usr/local/apt-keys/yggdrasil-keyring.gpg > /dev/null
RUN echo 'deb [signed-by=/usr/local/apt-keys/yggdrasil-keyring.gpg] http://neilalexander.s3.dualstack.eu-west-2.amazonaws.com/deb/ debian yggdrasil' | sudo tee /etc/apt/sources.list.d/yggdrasil.list
RUN apt-get update
RUN apt-get install yggdrasil

ENTRYPOINT ["/startup.sh"]
