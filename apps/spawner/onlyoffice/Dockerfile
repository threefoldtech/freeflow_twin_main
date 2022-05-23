FROM onlyoffice/documentserver

RUN apt update
# installing yggdrasil. Following instrunctions https://yggdrasil-network.github.io/installation-linux-deb.html
RUN gpg --fetch-keys https://neilalexander.s3.dualstack.eu-west-2.amazonaws.com/deb/key.txt
RUN gpg --export 569130E8CA20FBC4CB3FDE555898470A764B32C9 | sudo apt-key add -

RUN echo 'deb http://neilalexander.s3.dualstack.eu-west-2.amazonaws.com/deb/ debian yggdrasil' | sudo tee /etc/apt/sources.list.d/yggdrasil.list
RUN sudo apt-get update

RUN apt install yggdrasil



COPY yggdrasil.conf /etc/yggdrasil.conf

