FROM node:14-alpine

WORKDIR '/usr/src/app'

COPY ./ ./

# Install dependencies
RUN yarn install --silent
RUN yarn global add pm2

# Build
RUN yarn build

EXPOSE 3001

CMD ["yarn", "pm2"]
