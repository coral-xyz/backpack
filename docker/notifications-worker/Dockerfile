FROM node:18.1.0@sha256:82f9e078898dce32c7bf3232049715f1b8fbf0d62d5f3091bca20fcaede50bf0
WORKDIR /base
COPY ["package.json", "./package.json"]
COPY ["turbo.json", "./turbo.json"]
COPY ["yarn.lock", "./yarn.lock"]
COPY ["tsconfig.json", "./tsconfig.json"]
COPY ["tsconfig.base.json", "./tsconfig.base.json"]
COPY ["backend/native/notifications-worker", "./backend/native/notifications-worker"]
COPY ["backend/native/zeus", "./backend/native/zeus"]
COPY ["backend/native/chat-zeus", "./backend/native/chat-zeus"]
COPY ["backend/native/tsconfig.json", "./backend/native/tsconfig.json"]
COPY ["packages/db", "./packages/db"]
COPY ["packages/react-common", "./packages/react-common"]
COPY ["packages/message-sdk", "./packages/message-sdk"]
COPY ["packages/chat-sdk", "./packages/chat-sdk"]
COPY ["packages/common", "./packages/common"]
COPY ["packages/app-extension", "./packages/app-extension"]
COPY ["packages/wallet-standard", "./packages/wallet-standard"]
COPY ["packages/background", "./packages/background"]
COPY ["packages/blockchains", "./packages/blockchains"]
COPY ["packages/recoil", "./packages/recoil"]
COPY ["packages/ledger-injection", "./packages/ledger-injection"]
COPY ["packages/themes", "./packages/themes"]
COPY ["packages/provider-core", "./packages/provider-core"]
COPY ["packages/provider-injection", "./packages/provider-injection"]

RUN cd /base && yarn install && yarn run build
RUN cd /base/backend/native/notifications-worker && yarn run build
ENV VAPID_PUBLIC_KEY=BDW-VH2Acel5JQXyL80lna43up_0HfXSg_7A5TwhJ9WX_MZPzr9DhNvR7tzH16LT1XPXWMfemZdYHl_wPUGT1DQ
ENV VAPID_PRIVATE_KEY=LZ2o02-xNzos7djkyyQaWmfpDH0xXa646uGWqg7PPwE

EXPOSE 8083

CMD ["node", "/base/backend/native/notifications-worker/dist/index.js"]
