FROM node:18-bullseye-slim

ENV NODE_ENV production
USER node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --production
COPY . .

CMD [ "node", "index.js" ]
