# Деплой на Render.com

Файл `render.yaml` настроен на **Starter** и **постоянный диск 1 GB**, чтобы файл SQLite **не пропадал** после деплоя и перезапуска. На **Free** у Render файловая система сервиса **временная**: без диска база и загрузки обнуляются при каждом деплое.

## Способ 1: Через Blueprint (render.yaml)

1. Зайдите на [https://render.com](https://render.com) → Dashboard
2. Нажмите **Blueprint** → **Create Blueprint**
3. Подключите репозиторий GitHub с проектом
4. Render создаст сервис с диском и переменной `SQLITE_PATH=/var/data/yuristblog.sqlite`

После создания проверьте, что задан `JWT_SECRET` (в blueprint может сгенерироваться автоматически).

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
   - **Plan:** **Starter** (или выше), если нужен постоянный диск
4. **Disks → Add disk:** точка монтирования `/var/data`, размер от 1 GB
5. **Environment →** задайте `SQLITE_PATH` = `/var/data/yuristblog.sqlite`

## Переменные окружения (обязательно)

| Переменная | Значение |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Случайная строка минимум 32 символа |
| `SQLITE_PATH` | На проде с диском: `/var/data/yuristblog.sqlite` (см. `render.yaml`) |

### База данных (SQLite)

- **Локально:** файл `server/data/yuristblog.sqlite` (каталог создаётся автоматически).
- **Render:** каталог для `SQLITE_PATH` создаётся при старте; данные сохраняются только при использовании **Persistent Disk** и пути внутри точки монтирования.

## После деплоя

- Сервис будет доступен по URL из панели Render
- Health check: `GET /api/stats`
- API: `GET /api/posts`, `GET /api/categories`, `GET /api/tags`
- Админ-панель: `/admin` (пользователь по умолчанию из seed: `admin@yurist.uz` / `admin123`)

## Примечания

- На Free без диска новые статьи и категории **пропадут после следующего деплоя** — используйте Starter + disk или внешнюю БД.
- Free план Render засыпает через ~15 минут неактивности — первый запрос после пробуждения может занять 30–50 сек.
- Seed-данные (категории, теги, демо-посты, админ) создаются при первом запуске, если таблицы пусты.
