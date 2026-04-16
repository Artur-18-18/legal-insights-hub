# ЮристБлог — Платформа юридических постов

Блог-платформа для публикации юридических постов с категориями, тегами, поиском, PDF-экспортом и двуязычной поддержкой (RU/UZ).

## 🚀 Деплой в Railway

### Шаг 1: Подключите репозиторий
1. Откройте [Railway](https://railway.app)
2. Нажмите **New Project** → **Deploy from GitHub repo**
3. Выберите ваш репозиторий

### Шаг 2: База данных
Используется **SQLite** (файл по умолчанию `server/data/yuristblog.sqlite`). При необходимости задайте путь через переменную `SQLITE_PATH` и подключите постоянный том (volume), иначе данные сбросятся при пересборке контейнера.

### Шаг 3: Настройте переменные окружения
В настройках проекта (Variables) добавьте:

| Переменная | Значение |
|---|---|
| `JWT_SECRET` | Случайная строка (минимум 32 символа) |
| `NODE_ENV` | `production` |
| `SQLITE_PATH` | (опционально) абсолютный путь к файлу БД на томе |

### Шаг 4: Деплой
Railway автоматически:
1. Запустит `npm ci && npx vite build` (сборка)
2. Запустит `NODE_ENV=production node server/index.js` (сервер)

Готово! 🎉

---

## 🛠 Локальная разработка

### Установка зависимостей
```bash
npm install
```

Если после **обновления Node.js** сервер падает с ошибкой `better_sqlite3.node` / `NODE_MODULE_VERSION`, пересоберите нативный модуль:
```bash
npm rebuild better-sqlite3
```

### Запуск
```bash
# Фронтенд + бэкенд одновременно
npm run dev:all

# Только фронтенд (Vite)
npm run dev

# Только бэкенд (Express)
npm run server:dev
```

### Админ-панель
- URL: `/admin/login`
- Email: `admin@yurist.uz`
- Пароль: `admin123`

База SQLite хранится в `server/data/yuristblog.sqlite` (не коммитится в git). На хостингах без постоянного диска файл может сбрасываться при деплое — см. `RENDER_DEPLOY.md`.

---

## 📁 Структура

```
├── server/           # Express.js бэкенд
│   ├── index.js      # Точка входа сервера
│   ├── db.js         # Подключение к SQLite
│   ├── database.js   # Схема и запросы к БД
│   ├── data/         # Файл SQLite (yuristblog.sqlite, не в git)
│   └── routes/       # API маршруты
├── src/              # React фронтенд
│   ├── pages/        # Страницы
│   ├── components/   # UI компоненты
│   ├── lib/          # API слой, i18n, утилиты
│   └── contexts/     # React контексты
├── railway.json      # Конфигурация Railway
├── Procfile          # Конфигурация для Heroku/Railway
└── vite.config.ts    # Конфигурация Vite
```

## 🔧 Технологии

- **Фронтенд:** React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui, Quill Editor
- **Бэкенд:** Express.js 5, SQLite (better-sqlite3)
- **Авторизация:** JWT (jsonwebtoken), bcryptjs
- **PDF:** html2pdf.js
- **SEO:** react-helmet-async
