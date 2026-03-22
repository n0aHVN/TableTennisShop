FROM node:alpine

WORKDIR /app

COPY common ./common
WORKDIR /app/common
RUN npm install && npm run build

WORKDIR /app/order
COPY order/package*.json ./
RUN npm install
COPY order .

CMD ["npm", "start"]
