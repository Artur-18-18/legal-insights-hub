export interface Category {
  id: string;
  name: string;
  name_uz?: string;
  slug: string;
  description: string | null;
  description_uz?: string;
  icon: string | null;
}

export interface Tag {
  id: string;
  name: string;
  name_uz?: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  title_uz?: string;
  slug: string;
  excerpt: string | null;
  excerpt_uz?: string;
  content: string;
  content_uz?: string;
  featured_image: string | null;
  created_at: string;
  author_name: string;
  published: boolean;
  legislation_links: Array<{ title: string; url: string }>;
  category_id: string | null;
  categories: { name: string; name_uz?: string; slug: string; icon: string | null } | null;
  post_tags: Array<{ tags: { name: string; name_uz?: string; slug: string } | null }>;
  post_images: Array<{ id: string; url: string; alt_text: string | null; sort_order: number }>;
  post_videos?: Array<{ id: string; url: string; alt_text: string | null }>;
}

// Helper to get localized field
export function getLocalized<T extends string>(post: Record<string, T | undefined>, field: string, lang: string): T | undefined {
  const localizedField = `${field}_${lang}`;
  return (post as Record<string, T | undefined>)[localizedField];
}

const defaultCategories: Category[] = [
  { id: "1", name: "Корпоративное право", name_uz: "Korporativ huquq", slug: "corporate-law", description: "Правовое регулирование деятельности юридических лиц", description_uz: "Yuridik shaxslar faoliyatini huquqiy tartibga solish", icon: "Building2" },
  { id: "2", name: "Корпоративное управление", name_uz: "Korporativ boshqaruv", slug: "corporate-governance", description: "Структура и процессы управления компаниями", description_uz: "Kompaniyalarni boshqarish tuzilmalari va jarayonlari", icon: "Users" },
  { id: "3", name: "Конкурентное право", name_uz: "Raqobat huquqi", slug: "competition-law", description: "Антимонопольное регулирование и защита конкуренции", description_uz: "Antimonopiya tartibga solish va raqobatni himoya qilish", icon: "Scale" },
  { id: "4", name: "Налоги", name_uz: "Soliqlar", slug: "taxes", description: "Налоговое законодательство и практика", description_uz: "Soliq qonunchiligi va amaliyoti", icon: "Calculator" },
  { id: "5", name: "Строительство", name_uz: "Qurilish", slug: "construction", description: "Правовое регулирование строительной деятельности", description_uz: "Qurilish faoliyatini huquqiy tartibga solish", icon: "HardHat" },
];

const defaultTags: Tag[] = [
  { id: "1", name: "ГК РУз", name_uz: "FU O'zR", slug: "gk-ruz" },
  { id: "2", name: "НК РУз", name_uz: "SK O'zR", slug: "nk-ruz" },
  { id: "3", name: "Антимонополия", name_uz: "Antimonopoliya", slug: "antimonopoliya" },
  { id: "4", name: "ООО", name_uz: "MChJ", slug: "ooo" },
  { id: "5", name: "АО", name_uz: "AJ", slug: "ao" },
];

const defaultPosts: Post[] = [
  {
    id: "1",
    title: "Основы корпоративного права Узбекистана",
    title_uz: "O'zbekiston korporativ huquqi asoslari",
    slug: "osnovy-korporativnogo-prava",
    excerpt: "Обзор ключевых норм корпоративного законодательства Республики Узбекистан",
    excerpt_uz: "O'zbekiston Respublikasi korporativ qonunchiligining asosiy normalariga sharh",
    content: "<p>Корпоративное право Узбекистана регулирует создание, деятельность и ликвидацию юридических лиц.</p><h2>Основные источники</h2><p>Гражданский кодекс Республики Узбекистан является основным источником корпоративного права. Он устанавливает общие положения о юридических лицах, их правоспособности и организационно-правовых формах.</p><p>Закон «Об обществах с ограниченной и дополнительной ответственностью» детально регулирует порядок создания, реорганизации и ликвидации ООО.</p>",
    content_uz: "<p>O'zbekistonning korporativ huquqi yuridik shaxslarning tashkil etilishi, faoliyati va tugatilishini tartibga soladi.</p><h2>Asosiy manbalar</h2><p>O'zbekiston Respublikasi Fuqarolik kodeksi korporativ huquqning asosiy manbai hisoblanadi. U yuridik shaxslar, ularning huquq layoqati va tashkiliy-huquqiy shakllari haqidagi umumiy qoidalarni belgilaydi.</p><p>«Mas'uliyati cheklangan va qo'shimcha mas'uliyatli jamiyatlar to'g'risida»gi Qonun MChJni tuzish, qayta tashkil etish va tugatish tartibini batafsil tartibga soladi.</p>",
    featured_image: null,
    created_at: "2026-04-01T10:00:00Z",
    author_name: "Автор",
    published: true,
    legislation_links: [
      { title: "Гражданский кодекс РУз", url: "https://lex.uz/docs/111181" },
      { title: "Закон об ООО", url: "https://lex.uz/docs/8920" },
    ],
    category_id: "1",
    categories: { name: "Корпоративное право", slug: "corporate-law", icon: "Building2" },
    post_tags: [{ tags: { name: "ГК РУз", slug: "gk-ruz" } }, { tags: { name: "ООО", slug: "ooo" } }],
    post_images: [],
    post_videos: [],
  },
  {
    id: "2",
    title: "Налоговые льготы для IT-компаний",
    title_uz: "IT-kompaniyalar uchun soliq imtiyozlari",
    slug: "nalogovye-lgoty-it",
    excerpt: "Анализ налоговых преференций для компаний в сфере информационных технологий",
    excerpt_uz: "Axborot texnologiyalari sohasidagi kompaniyalar uchun soliq imtiyozlari tahlili",
    content: "<p>IT-компании в Узбекистане могут воспользоваться рядом налоговых льгот, предусмотренных действующим законодательством.</p><h2>Основные льготы</h2><p>Резиденты IT Park освобождаются от уплаты налога на прибыль, НДС, налога на имущество и земельного налога.</p>",
    content_uz: "<p>O'zbekistondagi IT-kompaniyalar amal qiluvchi qonunchilikda nazarda tutilgan bir qator soliq imtiyozlaridan foydalanishlari mumkin.</p><h2>Asosiy imtiyozlar</h2><p>IT Park rezidentlari foyda solig'i, QQS, mulk solig'i va yer solig'idan ozod qilinadi.</p>",
    featured_image: null,
    created_at: "2026-03-28T14:00:00Z",
    author_name: "Автор",
    published: true,
    legislation_links: [
      { title: "Налоговый кодекс РУз", url: "https://lex.uz/docs/4674902" },
    ],
    category_id: "4",
    categories: { name: "Налоги", slug: "taxes", icon: "Calculator" },
    post_tags: [{ tags: { name: "НК РУз", slug: "nk-ruz" } }],
    post_images: [],
    post_videos: [],
  },
  {
    id: "3",
    title: "Антимонопольное регулирование: новые правила",
    title_uz: "Antimonopoliya tartibga solish: yangi qoidalar",
    slug: "antimonopolnoe-regulirovanie",
    excerpt: "Обзор последних изменений в антимонопольном законодательстве",
    excerpt_uz: "Antimonopoliya qonunchiligiga kiritilgan so'nggi o'zgarishlarga sharh",
    content: "<p>Антимонопольное законодательство Узбекистана претерпело значительные изменения в последние годы.</p><h2>Ключевые изменения</h2><p>Новые правила ужесточают ответственность за злоупотребление доминирующим положением на рынке и за заключение антиконкурентных соглашений.</p>",
    content_uz: "<p>O'zbekistonning antimonopoliya qonunchiligi so'nggi yillarda jiddiy o'zgarishlarga uchradi.</p><h2>Asosiy o'zgarishlar</h2><p>Yangi qoidalar bozordagi ustun mavqeni suiiste'mol qilish va antiraqobat bitimlar tuzish uchun javobgarlikni kuchaytiradi.</p>",
    featured_image: null,
    created_at: "2026-03-25T09:00:00Z",
    author_name: "Автор",
    published: true,
    legislation_links: [
      { title: "Закон о конкуренции", url: "https://lex.uz/docs/4679962" },
    ],
    category_id: "3",
    categories: { name: "Конкурентное право", slug: "competition-law", icon: "Scale" },
    post_tags: [{ tags: { name: "Антимонополия", slug: "antimonopoliya" } }],
    post_images: [],
    post_videos: [],
  },
];

// Persisted data wrappers with localStorage
function getStoredPosts(): Post[] {
  const stored = localStorage.getItem("mock_posts");
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Post[];
      // Migration: add _uz fields if missing
      const migrated = parsed.map((post) => {
        const def = defaultPosts.find((d) => d.slug === post.slug);
        return {
          ...post,
          title_uz: post.title_uz || def?.title_uz || null,
          excerpt_uz: post.excerpt_uz || def?.excerpt_uz || null,
          content_uz: post.content_uz || def?.content_uz || null,
        };
      });
      localStorage.setItem("mock_posts", JSON.stringify(migrated));
      return migrated;
    } catch { /* ignore */ }
  }
  localStorage.setItem("mock_posts", JSON.stringify(defaultPosts));
  return [...defaultPosts];
}

function setStoredPosts(posts: Post[]) {
  localStorage.setItem("mock_posts", JSON.stringify(posts));
}

function getStoredCategories(): Category[] {
  const stored = localStorage.getItem("mock_categories");
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Category[];
      // Migration: add _uz fields if missing
      const migrated = parsed.map((cat) => {
        const def = defaultCategories.find((d) => d.slug === cat.slug);
        return {
          ...cat,
          name_uz: cat.name_uz || def?.name_uz || null,
          description_uz: cat.description_uz || def?.description_uz || null,
        };
      });
      localStorage.setItem("mock_categories", JSON.stringify(migrated));
      return migrated;
    } catch { /* ignore */ }
  }
  localStorage.setItem("mock_categories", JSON.stringify(defaultCategories));
  return [...defaultCategories];
}

function setStoredCategories(cats: Category[]) {
  localStorage.setItem("mock_categories", JSON.stringify(cats));
}

function getStoredTags(): Tag[] {
  const stored = localStorage.getItem("mock_tags");
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Tag[];
      // Migration: add name_uz field if missing
      const migrated = parsed.map((tag) => {
        const def = defaultTags.find((d) => d.slug === tag.slug);
        return {
          ...tag,
          name_uz: tag.name_uz || def?.name_uz || null,
        };
      });
      localStorage.setItem("mock_tags", JSON.stringify(migrated));
      return migrated;
    } catch { /* ignore */ }
  }
  localStorage.setItem("mock_tags", JSON.stringify(defaultTags));
  return [...defaultTags];
}

function setStoredTags(tg: Tag[]) {
  localStorage.setItem("mock_tags", JSON.stringify(tg));
}

// Export mutable arrays (synced with localStorage)
export let posts: Post[] = getStoredPosts();
export let categories: Category[] = getStoredCategories();
export let tags: Tag[] = getStoredTags();

// Re-export setters for API mutations
export function savePosts(p: Post[]) { posts = p; setStoredPosts(p); }
export function saveCategories(c: Category[]) { categories = c; setStoredCategories(c); }
export function saveTags(t: Tag[]) { tags = t; setStoredTags(t); }

export function getPostsByCategory(slug: string) {
  const category = categories.find((c) => c.slug === slug);
  if (!category) return null;
  const filtered = posts.filter((p) => p.categories?.slug === slug && p.published);
  return { category, posts: filtered };
}

export function getPostBySlug(slug: string) {
  return posts.find((p) => p.slug === slug && p.published) || null;
}

export function getPostsByTag(slug: string) {
  const tag = tags.find((t) => t.slug === slug);
  if (!tag) return null;
  const filtered = posts.filter((p) => p.post_tags.some((pt) => pt.tags?.slug === slug) && p.published);
  return { tag, posts: filtered };
}

export function searchPostsMock(query: string) {
  const q = query.toLowerCase();
  return posts.filter(
    (p) => p.published && (p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q))
  );
}
