# Build stage
FROM node:lts AS build-env
COPY . /app
WORKDIR /app

RUN npm i && npx tsc

# Create final production stage
FROM node:lts-slim AS run-env
WORKDIR /usr/app
COPY --from=build-env /app/dist /app/node_modules
COPY package.json public views ./

ENV NODE_ENV="production"
EXPOSE 3000
CMD ["npm", "run", "start"]