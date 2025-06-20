import express from "express";
import { getVoices, generateAudio } from "../controller/elevenlabs.ctrl";
const router = express.Router();

router.get("/voices", getVoices);
// router.post("/generate/audio", generateAudio);

export default router