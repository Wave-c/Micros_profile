# ---------- BUILD STAGE ----------
FROM node:20-alpine AS build
WORKDIR /app

# Копируем package.json и lock-файл
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходники
COPY . .

# Генерируем Prisma клиент
RUN npx prisma generate

# Собираем TypeScript
RUN npm run build


# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine AS production
WORKDIR /app

# Копируем только нужное
COPY package*.json ./

# Ставим только production зависимости
RUN npm install --omit=dev

# Копируем билд и prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/prisma ./prisma

EXPOSE 8077

# Переменная окружения
ENV NODE_ENV=production

# Запуск миграций + старт
CMD sh -c "npx prisma migrate deploy && node dist/app.js"