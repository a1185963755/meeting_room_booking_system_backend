FROM node:20-slim AS build-stage

WORKDIR /app

COPY package.json .

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install -g pnpm

COPY . .

RUN pnpm install


RUN pnpm run build

# production stage
FROM node:20-slim AS production-stage

COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/package.json /app/package.json

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install -g pnpm

RUN pnpm install


EXPOSE 6001

CMD ["node", "/app/main.js"]