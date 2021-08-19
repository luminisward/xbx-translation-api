FROM node:16-alpine AS build


WORKDIR /app
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile
COPY . ./

RUN yarn build


FROM node:16-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/xlsx /app/xlsx

EXPOSE 3001
CMD ["node", "dist/main.js" ]