// index.ts - Updated version
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import genaiRoutes from "./routes/genai.route";
import ttsRoute from "./routes/tts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created successfully');
}

app.use(cors());
app.use(express.json());

app.use("/api/genai", genaiRoutes);
app.use("/api/tts", ttsRoute);

app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
});