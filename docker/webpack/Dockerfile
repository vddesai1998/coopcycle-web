FROM node:8.11-alpine

WORKDIR /srv/coopcycle

COPY package.json /srv/coopcycle
COPY package-lock.json /srv/coopcycle

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
RUN npm install

COPY docker/webpack/start.sh /

CMD /start.sh
