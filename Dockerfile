FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --no-cache

COPY . .

RUN npx vite build

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "server/index.js"]
