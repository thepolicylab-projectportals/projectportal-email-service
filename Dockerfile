FROM node:lts-hydrogen

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci --only=production

COPY . .

CMD ["node", "index.js"]