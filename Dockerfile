FROM node:lts

RUN mkdir /opt/http-to-snmp
WORKDIR /opt/http-to-snmp
COPY . .

RUN npm install

ENTRYPOINT node index.js
