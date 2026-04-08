import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "ru" | "uz";

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<Lang, Record<string, string>> = {
  ru: {
    "site.name": "ЮристБлог",
    "site.title": "Юридический блог",
    "site.subtitle": "Аналитика и разборы законодательства в области корпоративного права, налогов и строительства",
    "nav.search": "Поиск статей",
    "nav.categories": "Категории",
    "nav.home": "Главная",
    "search.title": "Поиск статей",
    "search.placeholder": "Введите запрос...",
    "search.button": "Найти",
    "search.results": "Результаты по запросу",
    "search.nothing": "Ничего не найдено",
    "search.tags": "Теги",
    "posts.latest": "Последние публикации",
    "posts.empty": "Пока нет публикаций",
    "posts.soon": "Статьи скоро появятся",
    "posts.read": "Читать",
    "posts.back": "Назад",
    "posts.pdf": "PDF",
    "posts.legislation": "Ссылки на законодательство",
    "posts.notfound": "Статья не найдена",
    "posts.tohome": "← На главную",
    "category.empty": "В этой категории пока нет статей",
    "tag.empty": "Статей с этим тегом пока нет",
    "cat.corporate-law": "Корпоративное право",
    "cat.corporate-governance": "Корпоративное управление",
    "cat.competition-law": "Конкурентное право",
    "cat.taxes": "Налоги",
    "cat.construction": "Строительство",
    "admin.login": "Вход в админ-панель",
    "admin.email": "Email",
    "admin.password": "Пароль",
    "admin.signin": "Войти",
    "admin.logout": "Выйти",
    "admin.dashboard": "Панель управления",
    "admin.posts": "Статьи",
    "admin.newpost": "Новая статья",
    "admin.editpost": "Редактировать статью",
    "admin.title": "Заголовок",
    "admin.slug": "URL-адрес (slug)",
    "admin.excerpt": "Краткое описание",
    "admin.content": "Содержание (HTML)",
    "admin.category": "Категория",
    "admin.tags": "Теги",
    "admin.author": "Автор",
    "admin.published": "Опубликовано",
    "admin.save": "Сохранить",
    "admin.delete": "Удалить",
    "admin.cancel": "Отмена",
    "admin.images": "Изображения",
    "admin.upload": "Загрузить",
    "admin.legislation": "Ссылки на законодательство",
    "admin.addlink": "Добавить ссылку",
    "admin.linktitle": "Название",
    "admin.linkurl": "URL",
    "admin.draft": "Черновик",
    "admin.manage_tags": "Управление тегами",
    "admin.newtag": "Новый тег",
    "admin.tagname": "Название тега",
    "admin.tagslug": "Slug тега",
    "admin.noaccess": "Нет доступа",
    "admin.noaccess_desc": "У вас нет прав администратора",
    "footer.rights": "© {year} ЮристБлог",
  },
  uz: {
    "site.name": "YuristBlog",
    "site.title": "Yuridik blog",
    "site.subtitle": "Korporativ huquq, soliqlar va qurilish sohasida qonunchilik tahlili",
    "nav.search": "Maqolalarni qidirish",
    "nav.categories": "Kategoriyalar",
    "nav.home": "Bosh sahifa",
    "search.title": "Maqolalarni qidirish",
    "search.placeholder": "So'rovni kiriting...",
    "search.button": "Qidirish",
    "search.results": "So'rov bo'yicha natijalar",
    "search.nothing": "Hech narsa topilmadi",
    "search.tags": "Teglar",
    "posts.latest": "So'nggi nashrlar",
    "posts.empty": "Hali nashrlar yo'q",
    "posts.soon": "Maqolalar tez orada paydo bo'ladi",
    "posts.read": "O'qish",
    "posts.back": "Orqaga",
    "posts.pdf": "PDF",
    "posts.legislation": "Qonunchilik havolalari",
    "posts.notfound": "Maqola topilmadi",
    "posts.tohome": "← Bosh sahifaga",
    "category.empty": "Bu kategoriyada hali maqolalar yo'q",
    "tag.empty": "Bu teg bilan maqolalar hali yo'q",
    "cat.corporate-law": "Korporativ huquq",
    "cat.corporate-governance": "Korporativ boshqaruv",
    "cat.competition-law": "Raqobat huquqi",
    "cat.taxes": "Soliqlar",
    "cat.construction": "Qurilish",
    "admin.login": "Admin paneliga kirish",
    "admin.email": "Email",
    "admin.password": "Parol",
    "admin.signin": "Kirish",
    "admin.logout": "Chiqish",
    "admin.dashboard": "Boshqaruv paneli",
    "admin.posts": "Maqolalar",
    "admin.newpost": "Yangi maqola",
    "admin.editpost": "Maqolani tahrirlash",
    "admin.title": "Sarlavha",
    "admin.slug": "URL-manzil (slug)",
    "admin.excerpt": "Qisqa tavsif",
    "admin.content": "Mazmun (HTML)",
    "admin.category": "Kategoriya",
    "admin.tags": "Teglar",
    "admin.author": "Muallif",
    "admin.published": "Nashr qilingan",
    "admin.save": "Saqlash",
    "admin.delete": "O'chirish",
    "admin.cancel": "Bekor qilish",
    "admin.images": "Rasmlar",
    "admin.upload": "Yuklash",
    "admin.legislation": "Qonunchilik havolalari",
    "admin.addlink": "Havola qo'shish",
    "admin.linktitle": "Nomi",
    "admin.linkurl": "URL",
    "admin.draft": "Qoralama",
    "admin.manage_tags": "Teglarni boshqarish",
    "admin.newtag": "Yangi teg",
    "admin.tagname": "Teg nomi",
    "admin.tagslug": "Teg slug",
    "admin.noaccess": "Ruxsat yo'q",
    "admin.noaccess_desc": "Sizda administrator huquqlari yo'q",
    "footer.rights": "© {year} YuristBlog",
  },
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    return (saved === "uz" ? "uz" : "ru") as Lang;
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  const t = (key: string) => {
    const val = translations[lang][key];
    if (!val) return key;
    return val.replace("{year}", new Date().getFullYear().toString());
  };

  useEffect(() => {
    document.documentElement.lang = lang === "uz" ? "uz" : "ru";
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
