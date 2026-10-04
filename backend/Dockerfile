FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma
RUN DATABASE_URL="postgresql://user:pass@localhost:5432/build" DIRECT_URL="postgresql://user:pass@localhost:5432/build" npx prisma generate
COPY src ./src
USER node
EXPOSE 3000
CMD ["npm", "run", "start:hosted"]
