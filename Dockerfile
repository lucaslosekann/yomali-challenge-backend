FROM node:23.11.0-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm i

COPY . .

RUN npm run build
RUN npm prune --omit=dev

RUN npx prisma generate

ENV NODE_ENV=production

EXPOSE ${PORT:-3000}

CMD ["npm", "run", "start:migrate:prod"]