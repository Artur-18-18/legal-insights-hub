import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  title_uz: { type: String, default: null },
  slug: { type: String, required: true, unique: true, lowercase: true },
  excerpt: { type: String, default: null },
  excerpt_uz: { type: String, default: null },
  content: { type: String, required: true },
  content_uz: { type: String, default: null },
  featured_image: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  author_name: { type: String, default: "Автор" },
  published: { type: Boolean, default: false },
  legislation_links: [{ title: String, url: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  post_images: [{
    url: String,
    alt_text: String,
    sort_order: { type: Number, default: 0 },
  }],
});

postSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const Post = mongoose.model("Post", postSchema);
export default Post;
