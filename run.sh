

set -e
cd /home/hamdy/codewww/github/threefoldtech/www_digitaltwin

#need to ignore errors for getting nvm not sure why
set +e
source /home/hamdy/.publisher/nvm.sh

set -e
#nvm use --lts

export PATH=/home/hamdy/.publisher/versions/node/v14.17.0/bin:$PATH

if [ -f vue.config.js ]; then
    npm develop
else
    gridsome develop
fi
