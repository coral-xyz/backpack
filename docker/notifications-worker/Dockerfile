FROM node:18.1.0
WORKDIR /base
COPY ["package.json", "./package.json"]
COPY ["turbo.json", "./turbo.json"]
COPY ["yarn.lock", "./yarn.lock"]
COPY ["tsconfig.json", "./tsconfig.json"]
COPY ["backend/native/notifications-worker", "./backend/native/notifications-worker"]
COPY ["backend/native/zeus", "./backend/native/zeus"]
COPY ["backend/native/chat-zeus", "./backend/native/chat-zeus"]
COPY ["backend/native/tsconfig.json", "./backend/native/tsconfig.json"]
COPY ["packages/db", "./packages/db"]
COPY ["packages/chat-sdk", "./packages/chat-sdk"]
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

RUN cd /base
RUN yarn install
RUN yarn run build
RUN cd /base/backend/native/notifications-worker && yarn run build
ENV VAPID_PUBLIC_KEY=BDW-VH2Acel5JQXyL80lna43up_0HfXSg_7A5TwhJ9WX_MZPzr9DhNvR7tzH16LT1XPXWMfemZdYHl_wPUGT1DQ
ENV VAPID_PRIVATE_KEY=LZ2o02-xNzos7djkyyQaWmfpDH0xXa646uGWqg7PPwE

EXPOSE 8080

CMD ["node", "/base/backend/native/notifications-worker/dist/index.js"]
