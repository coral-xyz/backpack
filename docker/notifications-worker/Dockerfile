FROM node:18.1.0@sha256:82f9e078898dce32c7bf3232049715f1b8fbf0d62d5f3091bca20fcaede50bf0
WORKDIR /base
COPY ["package.json", "./package.json"]
COPY ["turbo.json", "./turbo.json"]
COPY ["yarn.lock", "./yarn.lock"]
COPY ["tsconfig.json", "./tsconfig.json"]
COPY ["tsconfig.base.json", "./tsconfig.base.json"]
COPY ["backend/native/notifications-worker", "./backend/native/notifications-worker"]
COPY ["backend/native/backend-common", "./backend/native/backend-common"]
COPY ["backend/native/zeus", "./backend/native/zeus"]
COPY ["backend/native/chat-zeus", "./backend/native/chat-zeus"]
COPY ["backend/native/tsconfig.json", "./backend/native/tsconfig.json"]
COPY ["packages/db", "./packages/db"]
COPY ["packages/react-common", "./packages/react-common"]
COPY ["packages/message-sdk", "./packages/message-sdk"]
COPY ["packages/chat-sdk", "./packages/chat-sdk"]
COPY ["packages/chat-xplat", "./packages/chat-xplat"]
COPY ["packages/common", "./packages/common"]
COPY ["packages/tamagui-core", "./packages/tamagui-core"]
COPY ["packages/app-extension", "./packages/app-extension"]
COPY ["packages/data-components", "./packages/data-components"]
COPY ["packages/wallet-standard", "./packages/wallet-standard"]
COPY ["packages/background", "./packages/background"]
COPY ["packages/recoil", "./packages/recoil"]
COPY ["packages/ledger-injection", "./packages/ledger-injection"]
COPY ["packages/themes", "./packages/themes"]
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

RUN cd /base && yarn install && yarn run build
RUN cd /base/backend/native/notifications-worker && yarn run build

EXPOSE 8080

WORKDIR /base/backend/native/notifications-worker

CMD ["node", "./dist/index.js"]
