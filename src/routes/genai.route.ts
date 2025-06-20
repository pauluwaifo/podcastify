import express from "express";
import { generateContent, upload } from "../controller/genai.ctrl";
const router = express.Router();

router.post("/generate", upload.array('files', 2), generateContent);

export default router