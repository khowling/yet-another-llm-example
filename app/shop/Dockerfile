# Build stage
FROM node:lts AS build-env
COPY . /app
WORKDIR /app

RUN npm i && npx tsc

# Create final production stage
FROM node:lts AS run-env
WORKDIR /app
COPY --from=build-env /app/dist ./dist
COPY --from=build-env /app/node_modules ./node_modules
COPY public ./public
COPY views ./views
COPY package.json ./

ENV NODE_ENV="production"
EXPOSE 3000
CMD ["node", "./dist/app.js", ]