FROM node:alpine as builder
WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install
COPY . .
RUN yarn build
ENV NODE_ENV $ENVIRONMENT
CMD ["npm","run","prod"]

