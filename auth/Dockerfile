FROM node:alpine

WORKDIR /app

COPY common ./common
WORKDIR /app/common
RUN npm install && npm run build

WORKDIR /app/auth
COPY auth/package*.json ./
RUN npm install
COPY auth .

CMD ["npm", "start"]
