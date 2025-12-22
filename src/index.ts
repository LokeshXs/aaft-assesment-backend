import express from "express";
import leadRoutes from "./routes/leadRoutes";
import pool from "./db";
import { initializeDB } from "./db/init";
import cors from "cors";
import dotenv from "dotenv";


const server = express();
const PORT = 8080;

server.use(cors()); //  allow all origins

// adding env 
dotenv.config();

// Middleware to read json body
server.use(express.json());

// Routes
server.get("/", (req, res) => {
  res.send("server is running");
});

// route groups
server.use("/api/leads", leadRoutes);

// starting server
server.listen(PORT, async () => {
  try {
    const client = await pool.connect();
    console.log("Database connected successfully ✅");
    await initializeDB();
    client.release();
    console.info("Server started on port:", PORT);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message || "Database connection failed ❌");
    }
    process.exit(1);
  }
});
