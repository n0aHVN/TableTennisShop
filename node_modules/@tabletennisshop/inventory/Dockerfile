FROM node:alpine

WORKDIR /app

COPY common ./common
WORKDIR /app/common
RUN npm install && npm run build

WORKDIR /app/inventory
COPY inventory/package*.json ./
RUN npm install
COPY inventory .

CMD ["npm", "start"]
