const API_URL = ""; // Same-origin in production, proxy in dev

interface Category {
  _id?: string;
  id?: string;
  name: string;
  name_uz?: string;
  slug: string;
  description?: string | null;
  description_uz?: string;
  icon?: string | null;
}

interface Tag {
  _id?: string;
  id?: string;
  name: string;
  name_uz?: string;
  slug: string;
}

interface Post {
  _id?: string;
  id?: string;
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
  category: { _id?: string; name: string; name_uz?: string; slug: string; icon?: string | null } | null;
  tags: Array<{ _id?: string; name: string; name_uz?: string; slug: string }>;
  post_images: Array<{ url: string; alt_text: string | null; sort_order: number }>;
  post_videos?: Array<{ url: string; alt_text: string | null }>;
}

async function fetchAPI(endpoint: string, options?: RequestInit): Promise<unknown> {
  // Spread `options` first, then set `headers`, so callers' Authorization is kept and
  // Content-Type is never dropped (previously ...options overwrote merged headers).
  const res = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string> | undefined),
    },
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
  getPosts: async () => {
    return fetchAPI("/posts?published=true") as Promise<Post[]>;
  },
  getAllPosts: async () => {
    return fetchAPI("/posts/admin/all", {
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
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
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
    }) as Promise<Post>;
  },
  createPost: async (body: unknown) => {
    return fetchAPI("/posts", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      body: JSON.stringify(body),
    }) as Promise<Post>;
  },
  updatePost: async (id: string, body: unknown) => {
    return fetchAPI(`/posts/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      body: JSON.stringify(body),
    }) as Promise<Post>;
  },
  deletePost: async (id: string) => {
    return fetchAPI(`/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
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
  createCategory: async (body: unknown) => {
    return fetchAPI("/categories", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      body: JSON.stringify(body),
    }) as Promise<Category>;
  },
  updateCategory: async (id: string, body: unknown) => {
    return fetchAPI(`/categories/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      body: JSON.stringify(body),
    }) as Promise<Category>;
  },
  deleteCategory: async (id: string) => {
    return fetchAPI(`/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
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
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      body: JSON.stringify(body),
    }) as Promise<Tag>;
  },
  updateTag: async (id: string, body: unknown) => {
    return fetchAPI(`/tags/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      body: JSON.stringify(body),
    }) as Promise<Tag>;
  },
  deleteTag: async (id: string) => {
    return fetchAPI(`/tags/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
    }) as Promise<Record<string, unknown>>;
  },

  // Stats
  getStats: async () => {
    return fetchAPI("/stats") as Promise<{ posts: number; drafts: number; categories: number; tags: number }>;
  },

  // Translation
  translate: async (payload: { text: string; source?: "ru" | "uz"; target?: "ru" | "uz"; format?: "text" | "html" }) => {
    return fetchAPI("/translate", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      body: JSON.stringify(payload),
    }) as Promise<{ translated: string }>;
  },
  translateBatch: async (payload: { items: Array<{ text: string; format?: "text" | "html"; field?: string }>; source?: "ru" | "uz"; target?: "ru" | "uz" }) => {
    return fetchAPI("/translate/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
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
