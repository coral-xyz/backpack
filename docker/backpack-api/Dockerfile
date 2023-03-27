FROM node:18.15.0@sha256:eee4c74962a855bc1694676cd5069460e545a8580e0e574b2c59eae4f40bd5bd
WORKDIR /base
COPY ["package.json", "./package.json"]
COPY ["turbo.json", "./turbo.json"]
COPY ["yarn.lock", "./yarn.lock"]
COPY ["tsconfig.json", "./tsconfig.json"]
COPY ["tsconfig.base.json", "./tsconfig.base.json"]
COPY ["packages/common", "./packages/common"]
COPY ["backend/native/backpack-api", "./backend/native/backpack-api"]
COPY ["backend/native/zeus", "./backend/native/zeus"]
COPY ["backend/native/chat-zeus", "./backend/native/chat-zeus"]
COPY ["backend/native/tsconfig.json", "./backend/native/tsconfig.json"]
COPY ["backend/native/backend-common", "./backend/native/backend-common"]

# set up yarn v3
COPY .yarnrc.yml .yarnrc.yml
COPY .yarn/ .yarn/
# RUN corepack enable && corepack prepare yarn@3.5.0 --activate

# Append the required lines to the .yarnrc.yml file
# YN0013 is cache-miss that will always hit on a fresh build
RUN echo '  - code: YN0013' >> .yarnrc.yml && \
    echo '    level: discard' >> .yarnrc.yml

RUN cd /base && yarn install && yarn run build && cd /base/backend/native/backpack-api && yarn run build

EXPOSE 8080

WORKDIR /base/backend/native/backpack-api

CMD ["node", "./dist/index.js"]
