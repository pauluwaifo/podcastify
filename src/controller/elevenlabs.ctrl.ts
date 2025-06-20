import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export const generateAudio = async (req: Request, res: Response, next: NextFunction) => {
  const { text, voiceId } = req.body;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Failed:", errBody);
      return res.status(500).json({ error: "Text-to-speech failed" });
    }

    const audio = await response.blob();
    const buffer = Buffer.from(await audio.arrayBuffer());

    res.setHeader("Content-Type", "audio/mpeg");
    res.status(200).send(buffer);
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: "Failed to generate audio" });
  }
};

export const getVoices = async (req: Request, res: Response) => {
  try {
    const response = await client.voices.getAll();
    res.status(200).json({message: "Voices fetched successfully", voices: response.voices});
  } catch (error) {
    console.error("Error fetching voices:", error);
    res.status(500).json({ error: "Failed to fetch voices" });
  }
}

