export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  created_at: string;
  author_name: string;
  published: boolean;
  legislation_links: Array<{ title: string; url: string }>;
  category_id: string | null;
  categories: { name: string; slug: string; icon: string | null } | null;
  post_tags: Array<{ tags: { name: string; slug: string } | null }>;
  post_images: Array<{ id: string; url: string; alt_text: string | null; sort_order: number }>;
}

export const categories: Category[] = [
  { id: "1", name: "Корпоративное право", slug: "corporate-law", description: "Правовое регулирование деятельности юридических лиц", icon: "Building2" },
  { id: "2", name: "Корпоративное управление", slug: "corporate-governance", description: "Структура и процессы управления компаниями", icon: "Users" },
  { id: "3", name: "Конкурентное право", slug: "competition-law", description: "Антимонопольное регулирование и защита конкуренции", icon: "Scale" },
  { id: "4", name: "Налоги", slug: "taxes", description: "Налоговое законодательство и практика", icon: "Calculator" },
  { id: "5", name: "Строительство", slug: "construction", description: "Правовое регулирование строительной деятельности", icon: "HardHat" },
];

export const tags: Tag[] = [
  { id: "1", name: "ГК РУз", slug: "gk-ruz" },
  { id: "2", name: "НК РУз", slug: "nk-ruz" },
  { id: "3", name: "Антимонополия", slug: "antimonopoliya" },
  { id: "4", name: "ООО", slug: "ooo" },
  { id: "5", name: "АО", slug: "ao" },
];

export const posts: Post[] = [
  {
    id: "1",
    title: "Основы корпоративного права Узбекистана",
    slug: "osnovy-korporativnogo-prava",
    excerpt: "Обзор ключевых норм корпоративного законодательства Республики Узбекистан",
    content: "<p>Корпоративное право Узбекистана регулирует создание, деятельность и ликвидацию юридических лиц.</p><h2>Основные источники</h2><p>Гражданский кодекс Республики Узбекистан является основным источником корпоративного права. Он устанавливает общие положения о юридических лицах, их правоспособности и организационно-правовых формах.</p><p>Закон «Об обществах с ограниченной и дополнительной ответственностью» детально регулирует порядок создания, реорганизации и ликвидации ООО.</p>",
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
  },
  {
    id: "2",
    title: "Налоговые льготы для IT-компаний",
    slug: "nalogovye-lgoty-it",
    excerpt: "Анализ налоговых преференций для компаний в сфере информационных технологий",
    content: "<p>IT-компании в Узбекистане могут воспользоваться рядом налоговых льгот, предусмотренных действующим законодательством.</p><h2>Основные льготы</h2><p>Резиденты IT Park освобождаются от уплаты налога на прибыль, НДС, налога на имущество и земельного налога.</p>",
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
  },
  {
    id: "3",
    title: "Антимонопольное регулирование: новые правила",
    slug: "antimonopolnoe-regulirovanie",
    excerpt: "Обзор последних изменений в антимонопольном законодательстве",
    content: "<p>Антимонопольное законодательство Узбекистана претерпело значительные изменения в последние годы.</p><h2>Ключевые изменения</h2><p>Новые правила ужесточают ответственность за злоупотребление доминирующим положением на рынке и за заключение антиконкурентных соглашений.</p>",
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
  },
];

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
