FROM node:18.15.0@sha256:eee4c74962a855bc1694676cd5069460e545a8580e0e574b2c59eae4f40bd5bd
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
COPY ["packages/chat-xplat", "./packages/chat-xplat"]
COPY ["packages/message-sdk", "./packages/message-sdk"]
COPY ["packages/common", "./packages/common"]
COPY ["packages/app-extension", "./packages/app-extension"]
COPY ["packages/data-components", "./packages/data-components"]
COPY ["packages/db", "./packages/db"]
COPY ["packages/wallet-standard", "./packages/wallet-standard"]
COPY ["packages/background", "./packages/background"]
COPY ["packages/tamagui-core", "./packages/tamagui-core"]
COPY ["packages/recoil", "./packages/recoil"]
COPY ["packages/ledger-injection", "./packages/ledger-injection"]
COPY ["packages/themes", "./packages/themes"]
COPY ["packages/react-common", "./packages/react-common"]
COPY ["packages/provider-core", "./packages/provider-core"]
COPY ["packages/provider-injection", "./packages/provider-injection"]
COPY ["packages/secure-background", "./packages/secure-background"]
COPY ["packages/secure-client", "./packages/secure-client"]

# set up yarn v3
COPY .yarnrc.yml .yarnrc.yml
COPY .yarn/ .yarn/
# RUN corepack enable && corepack prepare yarn@3.5.0 --activate

# Append the required lines to the .yarnrc.yml file
# YN0013 is cache-miss that will always hit on a fresh build
RUN echo '  - code: YN0013' >> .yarnrc.yml && \
    echo '    level: discard' >> .yarnrc.yml

RUN cd /base
RUN yarn install
RUN yarn run build
RUN cd /base/backend/native/xnft-api-server && yarn run build

EXPOSE 8080

WORKDIR /base/backend/native/xnft-api-server

CMD ["node", "./dist/index.js"]
