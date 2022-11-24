FROM node:18.1.0
WORKDIR /base
COPY ["package.json", "./package.json"]
COPY ["turbo.json", "./turbo.json"]
COPY ["yarn.lock", "./yarn.lock"]
COPY ["tsconfig.json", "./tsconfig.json"]
COPY ["backend/native/backend-ws", "./backend/native/backend-ws"]
COPY ["packages/common", "./packages/common"]
COPY ["packages/common-public", "./packages/common-public"]
COPY ["packages/app-extension", "./packages/app-extension"]
COPY ["packages/wallet-standard", "./packages/wallet-standard"]
COPY ["packages/background", "./packages/background"]
COPY ["packages/blockchains", "./packages/blockchains"]
COPY ["packages/recoil", "./packages/recoil"]
COPY ["packages/ledger-injection", "./packages/ledger-injection"]
COPY ["packages/themes", "./packages/themes"]
COPY ["packages/react-xnft", "./packages/react-xnft"]
COPY ["packages/react-xnft-dom-renderer", "./packages/react-xnft-dom-renderer"]
COPY ["packages/provider-core", "./packages/provider-core"]
COPY ["packages/provider-injection", "./packages/provider-injection"]

COPY ["backend/native/zeus", "./backend/native/zeus"]
COPY ["backend/native/chat-zeus", "./backend/native/chat-zeus"]
COPY ["backend/native/tsconfig.json", "./backend/native/tsconfig.json"]

RUN cd /base
RUN yarn install
RUN yarn run build
RUN cd /base/backend/native/backend-ws && yarn run build

EXPOSE 8080

CMD ["node", "/base/backend/native/backend-ws/dist/index.js"]
