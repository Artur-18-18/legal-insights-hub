import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, default: "Администратор" },
  role: { type: String, default: "admin" },
  created_at: { type: Date, default: Date.now },
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to create user with hashed password
userSchema.statics.createUser = async function (userData) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  return this.create({ ...userData, password: hashedPassword });
};

const User = mongoose.model("User", userSchema);
export default User;
