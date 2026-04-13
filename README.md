# ЮристБлог — Платформа юридических постов

Блог-платформа для публикации юридических постов с категориями, тегами, поиском, PDF-экспортом и двуязычной поддержкой (RU/UZ).

## 🚀 Деплой в Railway

### Шаг 1: Подключите репозиторий
1. Откройте [Railway](https://railway.app)
2. Нажмите **New Project** → **Deploy from GitHub repo**
3. Выберите ваш репозиторий

### Шаг 2: Добавьте MongoDB
1. В проекте нажмите **New** → **Database** → **Add MongoDB**
2. Railway автоматически создаст переменную `MONGO_URL`

### Шаг 3: Настройте переменные окружения
В настройках проекта (Variables) добавьте:

| Переменная | Значение |
|---|---|
| `MONGO_URI` | `${{MongoDB.MONGO_URL}}` (ссылка на Railway MongoDB) |
| `JWT_SECRET` | Случайная строка (минимум 32 символа) |
| `NODE_ENV` | `production` |

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
- Email: `admin@example.com`
- Пароль: `admin123`

---

## 📁 Структура

```
├── server/           # Express.js бэкенд
│   ├── index.js      # Точка входа сервера
│   ├── db.js         # Подключение к MongoDB
│   ├── models/       # Mongoose модели
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
- **Бэкенд:** Express.js 5, MongoDB (Mongoose)
- **Авторизация:** JWT (jsonwebtoken), bcryptjs
- **PDF:** html2pdf.js
- **SEO:** react-helmet-async
