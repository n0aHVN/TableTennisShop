FROM node:alpine

WORKDIR /app

COPY common ./common
WORKDIR /app/common
RUN npm install && npm run build

WORKDIR /app/config
COPY config/package*.json ./
RUN npm install
COPY config .

CMD ["npm", "start"]
