FROM node:15.0.0
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY ./ ./
RUN yarn install --network-concurrency 1
CMD ["yarn", "start"]