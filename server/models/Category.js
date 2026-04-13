import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  name_uz: { type: String, default: null },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: null },
  description_uz: { type: String, default: null },
  icon: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
