FROM node:alpine

WORKDIR /app

COPY common ./common
WORKDIR /app/common
RUN npm install && npm run build

WORKDIR /app/product
COPY product/package*.json ./
RUN npm install
COPY product .

CMD ["npm", "start"]
