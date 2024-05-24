FROM node:20-alpine3.18 AS development

WORKDIR /usr/src/app
COPY package.json ./
COPY package-lock.json ./

RUN npm ci --legacy-peer-deps \
  && npm cache clean --force

COPY . .

RUN npm run build # used strictly to get dist folder inside production stage

CMD npm install --legacy-peer-deps; npm run start:dev;

FROM node:20-alpine3.18  AS production

WORKDIR /usr/src/app
COPY package.json ./
COPY package-lock.json ./

RUN npm ci --legacy-peer-deps --omit=dev \
    && npm cache clean --force

COPY . .
#copy only files that you need

COPY --from=development /usr/src/app/dist ./dist

CMD ["npm", "run", "start:prod"]