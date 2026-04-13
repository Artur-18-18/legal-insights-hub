import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  name_uz: { type: String, default: null },
  slug: { type: String, required: true, unique: true, lowercase: true },
  created_at: { type: Date, default: Date.now },
});

const Tag = mongoose.model("Tag", tagSchema);
export default Tag;
