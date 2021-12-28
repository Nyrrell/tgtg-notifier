FROM node:16-alpine

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      wget

ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR usr/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --prod && yarn cache clean
COPY ./ ./
CMD yarn start