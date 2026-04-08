import { supabase } from "@/integrations/supabase/client";

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function getPosts(options?: {
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from("posts")
    .select(`*, categories(name, slug, icon), post_tags(tag_id, tags(name, slug))`)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (options?.categorySlug) {
    query = query.eq("categories.slug", options.categorySlug);
  }

  if (options?.search) {
    query = query.textSearch("search_vector", options.search, { type: "websearch", config: "russian" });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options?.limit || 10) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(`*, categories(name, slug, icon), post_tags(tag_id, tags(name, slug)), post_images(*)`)
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error) throw error;
  return data;
}

export async function getPostsByCategory(categorySlug: string) {
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", categorySlug)
    .single();

  if (!category) throw new Error("Category not found");

  const { data: posts, error } = await supabase
    .from("posts")
    .select(`*, categories(name, slug, icon), post_tags(tag_id, tags(name, slug))`)
    .eq("published", true)
    .eq("category_id", category.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return { category, posts: posts || [] };
}

export async function getTags() {
  const { data, error } = await supabase.from("tags").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function getPostsByTag(tagSlug: string) {
  const { data: tag } = await supabase
    .from("tags")
    .select("*")
    .eq("slug", tagSlug)
    .single();

  if (!tag) throw new Error("Tag not found");

  const { data: postTags } = await supabase
    .from("post_tags")
    .select("post_id")
    .eq("tag_id", tag.id);

  if (!postTags || postTags.length === 0) return { tag, posts: [] };

  const postIds = postTags.map((pt) => pt.post_id);

  const { data: posts, error } = await supabase
    .from("posts")
    .select(`*, categories(name, slug, icon), post_tags(tag_id, tags(name, slug))`)
    .eq("published", true)
    .in("id", postIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return { tag, posts: posts || [] };
}

export async function searchPosts(query: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(`*, categories(name, slug, icon), post_tags(tag_id, tags(name, slug))`)
    .eq("published", true)
    .textSearch("search_vector", query, { type: "websearch", config: "russian" })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
