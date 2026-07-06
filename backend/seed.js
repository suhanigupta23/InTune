import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from backend
dotenv.config({ path: '/Users/suhanigupta/.gemini/antigravity/scratch/Intune/in-sync-living-main/backend/.env' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI not found in env config.");
  process.exit(1);
}

// User schema definition
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  anonymousId: { type: String, required: true, unique: true },
  gender: { type: String },
  isVerified: { type: Boolean, default: false },
  maskedAadhaar: { type: String },
  vibeText: { type: String, default: "" },
  avatarSeed: { type: String }
});

const User = mongoose.model('User', userSchema);

const sampleUsers = [
  {
    name: "Riya Sharma",
    email: "riya.sharma@example.com",
    phone: "+91 9999900001",
    password: "hashedpassword123", // placeholder
    anonymousId: "EarlyBird_921",
    gender: "Female",
    isVerified: true,
    maskedAadhaar: "XXXX XXXX 8371",
    vibeText: "I am an early bird who wakes up at 6 AM. I love studying in absolute silence. Very clean, quiet habits, and focused on academics. No guests allowed.",
    avatarSeed: "riya"
  },
  {
    name: "Pooja Patel",
    email: "pooja.patel@example.com",
    phone: "+91 9999900002",
    password: "hashedpassword123",
    anonymousId: "NightOwl_402",
    gender: "Female",
    isVerified: true,
    maskedAadhaar: "XXXX XXXX 1928",
    vibeText: "Total night owl here, I stay up playing games or studying till 3 AM. I am friendly, social, and don't mind occasional noise or late night chatter. Light cleaning habits.",
    avatarSeed: "pooja"
  },
  {
    name: "Anjali Gupta",
    email: "anjali.gupta@example.com",
    phone: "+91 9999900003",
    password: "hashedpassword123",
    anonymousId: "CleanFreak_551",
    gender: "Female",
    isVerified: true,
    maskedAadhaar: "XXXX XXXX 7461",
    vibeText: "Extremely tidy and clean freak. I prefer to keep a daily cleaning rota and keep the kitchen spotless. I wake up around 8 AM, quiet lifestyle, love reading books.",
    avatarSeed: "anjali"
  },
  {
    name: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    phone: "+91 9999900004",
    password: "hashedpassword123",
    anonymousId: "FoodieChef_301",
    gender: "Female",
    isVerified: true,
    maskedAadhaar: "XXXX XXXX 3391",
    vibeText: "I love cooking and sharing meals. Very active and social, I wake up at 8 AM and sleep around 11 PM. Keep things moderately clean and love having weekend chats over tea.",
    avatarSeed: "sneha"
  },
  {
    name: "Tanya Verma",
    email: "tanya.verma@example.com",
    phone: "+91 9999900005",
    password: "hashedpassword123",
    anonymousId: "ChillRoomie_118",
    gender: "Female",
    isVerified: true,
    maskedAadhaar: "XXXX XXXX 5562",
    vibeText: "Pretty chill and balanced roommate. Sleep around midnight, wake up at 8:30 AM. Love watching Netflix shows, keep things organized, and respect privacy.",
    avatarSeed: "tanya"
  },
  {
    name: "Meera Nair",
    email: "meera.nair@example.com",
    phone: "+91 9999900006",
    password: "hashedpassword123",
    anonymousId: "QuietStudious_772",
    gender: "Female",
    isVerified: true,
    maskedAadhaar: "XXXX XXXX 9182",
    vibeText: "Focused heavily on college and exams. I wake up early, study in the library all day, sleep by 10 PM. Quiet, non-interfering, neat habits, love calm spaces.",
    avatarSeed: "meera"
  }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Database connected successfully.");

    // Delete existing sample users to prevent email duplicate errors
    console.log("Cleaning up previous sample users...");
    await User.deleteMany({ email: { $in: sampleUsers.map(u => u.email) } });

    console.log("Inserting new diverse roommate samples...");
    await User.insertMany(sampleUsers);
    console.log("Successfully seeded 6 diverse roommate profiles!");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

seed();
