FROM node:18.1.0
WORKDIR /base
COPY ["package.json", "./package.json"]
COPY ["turbo.json", "./turbo.json"]
COPY ["yarn.lock", "./yarn.lock"]
COPY ["tsconfig.json", "./tsconfig.json"]
COPY ["backend/native/xnft-api-server", "./backend/native/xnft-api-server"]
COPY ["backend/native/zeus", "./backend/native/zeus"]
COPY ["backend/native/tsconfig.json", "./backend/native/tsconfig.json"]

RUN cd /base
RUN yarn install
RUN yarn run build
RUN cd /base/backend/native/xnft-api-server && yarn run build
ENV VAPID_PUBLIC_KEY=BDW-VH2Acel5JQXyL80lna43up_0HfXSg_7A5TwhJ9WX_MZPzr9DhNvR7tzH16LT1XPXWMfemZdYHl_wPUGT1DQ
ENV VAPID_PRIVATE_KEY=LZ2o02-xNzos7djkyyQaWmfpDH0xXa646uGWqg7PPwE

EXPOSE 8080

CMD ["node", "/base/backend/native/xnft-api-server/dist/index.js"]
