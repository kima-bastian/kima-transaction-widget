FROM node:22

WORKDIR /app

COPY yarn.lock ./

RUN yarn install

COPY . .

WORKDIR /app/example

RUN yarn install
RUN yarn build

EXPOSE 5173

CMD ["yarn", "preview", "--host"]