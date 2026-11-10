import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((url) => url.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// make sure the database is connected before every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/", (req, res) => {
  res.json({ message: "StockNest API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    app: "StockNest API",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
