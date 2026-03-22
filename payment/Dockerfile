FROM node:alpine

WORKDIR /app

COPY common ./common
WORKDIR /app/common
RUN npm install && npm run build

WORKDIR /app/payment
COPY payment/package*.json ./
RUN npm install
COPY payment .

CMD ["npm", "start"]
