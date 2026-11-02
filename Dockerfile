FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    chromium \
    libgbm1 libnss3 libatk-bridge2.0-0 libdrm2 libxcomposite1 \
    libxdamage1 libxrandr2 libcups2 libasound2 libpangocairo-1.0-0 \
    libxshmfence1 libgtk-3-0 \
    fonts-liberation fonts-noto-color-emoji fonts-noto-cjk fonts-noto-core \
    fontconfig \
    && rm -rf /var/lib/apt/lists/* && fc-cache -fv

RUN npm install -g hyperframes

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /project

# Копируем package.json и server.js
COPY package.json .
COPY server.js .

# Устанавливаем express локально
RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]
