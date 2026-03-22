FROM node:alpine

WORKDIR /app

COPY common ./common
WORKDIR /app/common
RUN npm install && npm run build

WORKDIR /app/expiration
COPY expiration/package*.json ./
RUN npm install
COPY expiration .

CMD ["npm", "start"]
