FROM node:18.1.0@sha256:82f9e078898dce32c7bf3232049715f1b8fbf0d62d5f3091bca20fcaede50bf0
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

RUN cd /base && yarn install && yarn run build && cd /base/backend/native/backpack-api && yarn run build

EXPOSE 8080

WORKDIR /base/backend/native/backpack-api

CMD ["node", "./dist/index.js"]
