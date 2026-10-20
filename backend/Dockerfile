FROM node:24-slim

WORKDIR /app

ENV DATABASE_URL="file:./data/dev.db"

COPY package.json package-lock.json prisma7.config.ts ./
COPY prisma ./prisma
RUN npm ci

# Copy the source code
COPY . .

RUN mkdir -p data

EXPOSE 3000

# Apply migrations, then start the API
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]