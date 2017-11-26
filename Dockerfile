FROM node:8-alpine

RUN apk add --no-cache make gcc g++ python

WORKDIR /server

COPY package.json package-lock.json ./

RUN npm install --production

COPY . .

ENV NODE_ENV production

RUN apk del make gcc g++ python

EXPOSE 3000
CMD ["npm", "start"]