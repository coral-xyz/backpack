# Stage 1: Build and install dependencies
FROM node:18-alpine AS build
WORKDIR /base
COPY ["package.json", "./package.json"]
COPY ["turbo.json", "./turbo.json"]
COPY ["yarn.lock", "./yarn.lock"]
COPY ["tsconfig.json", "./tsconfig.json"]
COPY ["tsconfig.base.json", "./tsconfig.base.json"]
COPY ["backend/native/backend-ws", "./backend/native/backend-ws"]
COPY ["packages/chat-sdk", "./packages/chat-sdk"]
COPY ["packages/common", "./packages/common"]
COPY ["packages/db", "./packages/db"]
COPY ["packages/react-common", "./packages/react-common"]
COPY ["packages/message-sdk", "./packages/message-sdk"]
COPY ["packages/app-extension", "./packages/app-extension"]
COPY ["packages/wallet-standard", "./packages/wallet-standard"]
COPY ["packages/tamagui-core", "./packages/tamagui-core"]
COPY ["packages/background", "./packages/background"]
COPY ["packages/blockchains", "./packages/blockchains"]
COPY ["packages/recoil", "./packages/recoil"]
COPY ["packages/ledger-injection", "./packages/ledger-injection"]
COPY ["packages/themes", "./packages/themes"]
COPY ["packages/provider-core", "./packages/provider-core"]
COPY ["packages/provider-injection", "./packages/provider-injection"]
COPY ["backend/native/zeus", "./backend/native/zeus"]
COPY ["backend/native/chat-zeus", "./backend/native/chat-zeus"]
COPY ["backend/native/backend-common", "./backend/native/backend-common"]
COPY ["backend/native/tsconfig.json", "./backend/native/tsconfig.json"]
COPY .yarnrc.yml .yarnrc.yml
COPY .yarn/ .yarn/
RUN yarn install && \
    yarn run build --scope @mono/native/zeus && \
    yarn run build --scope @mono/native/chat-zeus && \
    yarn run build --scope @mono/common && \
    yarn run build --scope @mono/native/backend-common && \
    yarn run build --scope @mono/native/backend-ws

# Stage 2: Copy built code to a new image
FROM node:18-alpine
WORKDIR /base
COPY --from=build /base/backend/native/backend-ws ./
EXPOSE 8080
CMD ["node", "dist/index.js"]
