import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import genaiRoutes from "./routes/genai.route";
import elevenlabsRoute from "./routes/elevenlabs.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/genai", genaiRoutes);
app.use("/api/elevenlabs", elevenlabsRoute)

app.use(notFound);
app.use(errorHandler);


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
