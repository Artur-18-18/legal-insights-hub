import { getAdminToken } from "./authBridge";

const API_URL = ""; // Same-origin in production, proxy in dev

interface Category {
  _id?: string;
  id?: string;
  name: string;
  name_uz?: string;
  name_en?: string;
  slug: string;
  description?: string | null;
  description_uz?: string;
  description_en?: string;
  icon?: string | null;
}

interface Tag {
  _id?: string;
  id?: string;
  name: string;
  name_uz?: string;
  name_en?: string;
  slug: string;
}

interface Post {
  _id?: string;
  id?: string;
  title: string;
  title_uz?: string;
  title_en?: string;
  slug: string;
  excerpt: string | null;
  excerpt_uz?: string;
  excerpt_en?: string;
  content: string;
  content_uz?: string;
  content_en?: string;
  featured_image: string | null;
  created_at: string;
  author_name: string;
  published: boolean;
  legislation_links: Array<{ title: string; url: string }>;
  category: {
    _id?: string;
    name: string;
    name_uz?: string;
    name_en?: string;
    slug: string;
    icon?: string | null;
  } | null;
  tags: Array<{ _id?: string; name: string; name_uz?: string; name_en?: string; slug: string }>;
  post_images: Array<{ url: string; alt_text: string | null; sort_order: number }>;
  post_videos?: Array<{ url: string; alt_text: string | null }>;
}

/** Заголовки авторизации: Bearer + резервный X-Access-Token (часть прокси обрезает только Authorization). */
export function getAuthHeaders(tokenOverride?: string | null): Record<string, string> {
  const explicit =
    tokenOverride != null && String(tokenOverride).trim() !== "" ? String(tokenOverride).trim() : null;
  const t = explicit ?? getAdminToken();
  if (!t) return {};
  return {
    Authorization: `Bearer ${t}`,
    "X-Access-Token": t,
  };
}

function mergeRequestHeaders(options?: RequestInit): Record<string, string> {
  const out: Record<string, string> = { "Content-Type": "application/json" };
  const h = options?.headers;
  if (!h) return out;
  if (h instanceof Headers) {
    h.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }
  if (Array.isArray(h)) {
    for (const [key, value] of h) out[key] = value;
    return out;
  }
  Object.assign(out, h);
  return out;
}

async function fetchAPI(endpoint: string, options?: RequestInit): Promise<unknown> {
  const { headers: _skip, ...rest } = options ?? {};
  const res = await fetch(`${API_URL}/api${endpoint}`, {
    ...rest,
    credentials: rest.credentials ?? "same-origin",
    headers: mergeRequestHeaders(options),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error((error as Record<string, string>).error || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  // Posts
  /** Публичные посты; фильтры и лимит снижают объём данных (быстрее главная, категории, теги). */
  getPosts: async (opts?: {
    category?: string;
    tag?: string;
    search?: string;
    limit?: number;
  }) => {
    const sp = new URLSearchParams({ published: "true" });
    if (opts?.category) sp.set("category", opts.category);
    if (opts?.tag) sp.set("tag", opts.tag);
    if (opts?.search != null && String(opts.search).trim()) sp.set("search", String(opts.search).trim());
    if (opts?.limit != null && Number.isFinite(opts.limit) && opts.limit > 0) {
      sp.set("limit", String(Math.min(200, Math.floor(opts.limit))));
    }
    return fetchAPI(`/posts?${sp.toString()}`) as Promise<Post[]>;
  },
  /** POST вместо GET: Vite/прокси иногда не передают Authorization на GET /api/.../admin/all */
  getAllPosts: async (token?: string | null) => {
    return fetchAPI("/posts/admin/list", {
      method: "POST",
      headers: getAuthHeaders(token),
      body: "{}",
      cache: "no-store",
    }) as Promise<Post[]>;
  },
  getPost: async (slug: string) => {
    return fetchAPI(`/posts/${slug}`) as Promise<Post>;
  },
  getPostBySlug: async (slug: string) => {
    return fetchAPI(`/posts/${slug}`) as Promise<Post>;
  },
  /** Загрузка поста по id (админка, редактирование) */
  getPostForAdmin: async (id: string) => {
    return fetchAPI(`/posts/admin/post/${id}`, {
      headers: getAuthHeaders(),
    }) as Promise<Post>;
  },
  createPost: async (body: unknown, token?: string | null) => {
    return fetchAPI("/posts/admin/create", {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(body),
    }) as Promise<Post>;
  },
  updatePost: async (id: string, body: unknown, token?: string | null) => {
    return fetchAPI(`/posts/admin/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(body),
    }) as Promise<Post>;
  },
  deletePost: async (id: string) => {
    return fetchAPI(`/posts/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }) as Promise<Record<string, unknown>>;
  },

  // Categories
  getCategories: async () => {
    const categories = (await fetchAPI("/categories")) as Category[];
    return categories.map((category) => ({
      ...category,
      id: category.id || category._id,
    }));
  },
  /** Одна категория по slug; 404 → null (без исключения). */
  getCategoryBySlug: async (slug: string): Promise<Category | null> => {
    const res = await fetch(`${API_URL}/api/categories/${encodeURIComponent(slug)}`, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      const err = (await res.json().catch(() => ({ error: "Request failed" }))) as { error?: string };
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const text = await res.text();
    if (!text) return null;
    const c = JSON.parse(text) as Category;
    return { ...c, id: c.id || c._id };
  },
  createCategory: async (body: unknown) => {
    return fetchAPI("/categories", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }) as Promise<Category>;
  },
  updateCategory: async (id: string, body: unknown, token?: string | null) => {
    return fetchAPI(`/categories/admin/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(body),
    }) as Promise<Category>;
  },
  deleteCategory: async (id: string, token?: string | null) => {
    return fetchAPI(`/categories/admin/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    }) as Promise<Record<string, unknown>>;
  },

  // Tags
  getTags: async () => {
    const tags = (await fetchAPI("/tags")) as Tag[];
    return tags.map((tag) => ({
      ...tag,
      id: tag.id || tag._id,
    }));
  },
  createTag: async (body: unknown) => {
    return fetchAPI("/tags", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }) as Promise<Tag>;
  },
  updateTag: async (id: string, body: unknown) => {
    return fetchAPI(`/tags/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }) as Promise<Tag>;
  },
  deleteTag: async (id: string) => {
    return fetchAPI(`/tags/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }) as Promise<Record<string, unknown>>;
  },

  // Stats
  getStats: async () => {
    return fetchAPI("/stats") as Promise<{ posts: number; drafts: number; categories: number; tags: number }>;
  },

  // Translation
  translate: async (payload: {
    text: string;
    source?: "ru" | "uz" | "en";
    target?: "ru" | "uz" | "en";
    format?: "text" | "html";
  }) => {
    return fetchAPI("/translate", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }) as Promise<{ translated: string }>;
  },
  translateBatch: async (payload: {
    items: Array<{ text: string; format?: "text" | "html"; field?: string }>;
    source?: "ru" | "uz" | "en";
    target?: "ru" | "uz" | "en";
  }) => {
    return fetchAPI("/translate/batch", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }) as Promise<{ results: Array<{ field?: string; translated: string; error?: string }> }>;
  },

  // Auth
  login: async (email: string, password: string) => {
    return fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }) as Promise<{ token: string; user: { email: string; name: string; role: string } }>;
  },
};

export { API_URL };
export type { Post, Category, Tag };
