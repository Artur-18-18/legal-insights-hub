# Деплой на Render.com

## Способ 1: Через Blueprint (render.yaml)

1. Зайдите на [https://render.com](https://render.com) → Dashboard
2. Нажмите **Blueprint** → **Create Blueprint**
3. Подключите репозиторий GitHub с проектом
4. Render автоматически прочитает `render.yaml` и создаст сервис

После создания в настройках сервиса укажите переменные окружения (см. ниже).

## Способ 2: Вручную

1. **New + → Web Service**
2. Подключите репозиторий
3. Настройки:
   - **Name:** `yuristblog`
   - **Region:** Frankfurt (EU)
   - **Branch:** `main`
   - **Root Directory:** оставьте пустым
   - **Runtime:** Node
   - **Build Command:** `npm ci && npx vite build`
   - **Start Command:** `NODE_ENV=production node server/index.js`
   - **Plan:** Free

## Переменные окружения (обязательно)

| Переменная | Значение |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Случайная строка минимум 32 символа |

### База данных (SQLite)

По умолчанию создаётся файл `server/data/yuristblog.sqlite`. На Render без постоянного диска данные не переживают деплой. При необходимости задайте `SQLITE_PATH` на смонтированный том или используйте платный **Persistent Disk**.

## После деплоя

- Сервис будет доступен на `https://yuristblog.onrender.com`
- Health check: `GET /api/stats`
- API: `GET /api/posts`, `GET /api/categories`, `GET /api/tags`
- Админ-панель: `/admin` (логин: `admin@example.com` / пароль: `admin123`)

## Примечания

- Free план Render засыпает через 15 минут неактивности — первый запрос после пробуждения занимает 30-50 сек
- Для стабильной работы рассмотрите план **Starter** ($7/мес)
- Seed-данные (категории, теги, посты, админ) создаются автоматически при первом запуске
