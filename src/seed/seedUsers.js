import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

const demoUsers = [
  {
    name: "NestMart Admin",
    email: "admin@nestmart.com",
    password: "Admin@123",
    role: "admin",
  },
  {
    name: "NestMart Manager",
    email: "manager@nestmart.com",
    password: "Manager@123",
    role: "manager",
  },
  {
    name: "NestMart Staff",
    email: "staff@nestmart.com",
    password: "Staff@123",
    role: "staff",
  },
];

await mongoose.connect(process.env.MONGODB_URI);

for (const item of demoUsers) {
  const exists = await User.findOne({ email: item.email });
  if (exists) {
    console.log(`Already exists: ${item.email}`);
    continue;
  }
  const hashed = await bcrypt.hash(item.password, 10);
  await User.create({ ...item, password: hashed });
  console.log(`Created ${item.role}: ${item.email}`);
}

await mongoose.disconnect();
console.log("Seeding finished");
