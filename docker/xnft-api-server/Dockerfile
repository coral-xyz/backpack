FROM node:18.1.0@sha256:82f9e078898dce32c7bf3232049715f1b8fbf0d62d5f3091bca20fcaede50bf0
WORKDIR /base
COPY ["package.json", "./package.json"]
COPY ["turbo.json", "./turbo.json"]
COPY ["yarn.lock", "./yarn.lock"]
COPY ["tsconfig.json", "./tsconfig.json"]
COPY ["tsconfig.base.json", "./tsconfig.base.json"]
COPY ["backend/native/xnft-api-server", "./backend/native/xnft-api-server"]
COPY ["backend/native/zeus", "./backend/native/zeus"]
COPY ["backend/native/chat-zeus", "./backend/native/chat-zeus"]
COPY ["backend/native/backend-common", "./backend/native/backend-common"]
COPY ["backend/native/tsconfig.json", "./backend/native/tsconfig.json"]
COPY ["packages/chat-sdk", "./packages/chat-sdk"]
COPY ["packages/message-sdk", "./packages/message-sdk"]
COPY ["packages/common", "./packages/common"]
COPY ["packages/app-extension", "./packages/app-extension"]
COPY ["packages/db", "./packages/db"]
COPY ["packages/wallet-standard", "./packages/wallet-standard"]
COPY ["packages/background", "./packages/background"]
COPY ["packages/blockchains", "./packages/blockchains"]
COPY ["packages/tamagui-core", "./packages/tamagui-core"]
COPY ["packages/recoil", "./packages/recoil"]
COPY ["packages/ledger-injection", "./packages/ledger-injection"]
COPY ["packages/themes", "./packages/themes"]
COPY ["packages/react-common", "./packages/react-common"]
COPY ["packages/provider-core", "./packages/provider-core"]
COPY ["packages/provider-injection", "./packages/provider-injection"]

RUN cd /base
RUN yarn install
RUN yarn run build
RUN cd /base/backend/native/xnft-api-server && yarn run build

EXPOSE 8080

WORKDIR /base/backend/native/xnft-api-server

CMD ["node", "./dist/index.js"]
