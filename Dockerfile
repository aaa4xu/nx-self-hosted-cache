FROM node:14.7-alpine
ENV HTTP_PORT 80
ENV NODE_ENV production
EXPOSE 80
HEALTHCHECK CMD node src/healthcheck.js || exit 1
WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn --frozen-lockfile

COPY src src

ENTRYPOINT ["yarn", "start"]
