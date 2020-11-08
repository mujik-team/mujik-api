FROM node:14-alpine

WORKDIR '/usr/src/app'

COPY ./ ./

# Install dependencies
RUN yarn install --silent

# Build
RUN yarn build

EXPOSE 3001

CMD ["yarn", "start"]
