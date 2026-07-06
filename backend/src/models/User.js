import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true },
    email:         { type: String, required: true, unique: true },
    phone:         { type: String },
    password:      { type: String, required: true },
    anonymousId:   { type: String, required: true, unique: true },
    gender:        { type: String },
    isVerified:    { type: Boolean, default: false },
    maskedAadhaar: { type: String },
    vibeText:      { type: String, default: "" },
    avatarSeed:    { type: String }
  },
  { timestamps: true }
);


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPwd) {
  return bcrypt.compare(enteredPwd, this.password);
};

export default mongoose.model('User', userSchema);
