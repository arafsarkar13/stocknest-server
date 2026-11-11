import "dotenv/config";
import mongoose from "mongoose";
import Supplier from "../models/Supplier.js";

const suppliers = [
  {
    name: "Padma Electronics Ltd.",
    email: "sales@padma-electronics.example",
    phone: "+8801711000001",
    address: "Motijheel, Dhaka",
  },
  {
    name: "Meghna Fresh Foods",
    email: "orders@meghna-foods.example",
    phone: "+8801711000002",
    address: "Tejgaon Industrial Area, Dhaka",
  },
  {
    name: "Jamuna Home & Living",
    email: "hello@jamuna-home.example",
    phone: "+8801711000003",
    address: "Agrabad, Chattogram",
  },
  {
    name: "Karnaphuli Beauty Supply",
    email: "supply@karnaphuli-beauty.example",
    phone: "+8801711000004",
    address: "Zindabazar, Sylhet",
  },
  {
    name: "Sundarban Fashion House",
    email: "trade@sundarban-fashion.example",
    phone: "+8801711000005",
    address: "Narayanganj",
  },
];

await mongoose.connect(process.env.MONGODB_URI);

for (const item of suppliers) {
  const exists = await Supplier.findOne({ name: item.name });
  if (exists) {
    console.log(`Already exists: ${item.name}`);
    continue;
  }
  await Supplier.create(item);
  console.log(`Created: ${item.name}`);
}

await mongoose.disconnect();
console.log("Suppliers seeded");
