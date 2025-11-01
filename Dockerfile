FROM node:22-alpine

WORKDIR usr/app
COPY ./ ./
RUN yarn install \
&& yarn build \
&& rm -rf node_modules \
&& yarn install --production \
&& yarn cache clean

CMD yarn start