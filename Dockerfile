FROM node:22-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true

RUN corepack enable

WORKDIR /usr/app
COPY ./ ./

RUN pnpm install --frozen-lockfile \
  && pnpm build \
  && pnpm prune --prod

CMD pnpm start