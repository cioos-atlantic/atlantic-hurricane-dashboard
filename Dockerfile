FROM node:lts-buster

WORKDIR /react
RUN npm install
COPY react/package.json ./package.json
COPY react/package-lock.json ./package-lock.json

RUN npm install

COPY . .

EXPOSE 3500

CMD ["tail", "-f /dev/null"]
