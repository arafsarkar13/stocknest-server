import mongoose from "mongoose";

const cache =
  global.mongooseCache ||
  (global.mongooseCache = { conn: null, promise: null });

export async function connectDB() {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
  }
  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null; // allow a retry on the next request
    throw error;
  }
  return cache.conn;
}
