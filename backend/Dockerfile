FROM node:24-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY backend ./backend
ENV NODE_ENV=production PORT=8023
USER node
CMD ["node", "backend/src/server.js"]
