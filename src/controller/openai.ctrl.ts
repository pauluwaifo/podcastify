import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

export const generateAudio = async (req: Request, res: Response, next: NextFunction) => {
  const { text, voice = "alloy", model = "tts-1", speed = 1.0 } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: text,
        voice_id: voice,
        response_format: "mp3",
        speed,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI TTS error:", errorText);
       res.status(response.status).json({ error: "Text-to-speech request failed" });
    }

    const audioBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Unexpected error during TTS:", error);
    res.status(500).json({ error: "Internal server error generating audio" });
  }
};

export const getVoices = async (req: Request, res: Response) => {
  try {
    const voices = [
      { voiceId: "alloy", name: "Alloy", description: "Neutral, balanced voice" },
      { voiceId: "echo", name: "Echo", description: "Male voice" },
      { voiceId: "fable", name: "Fable", description: "British accent" },
      { voiceId: "onyx", name: "Onyx", description: "Deep male voice" },
      { voiceId: "nova", name: "Nova", description: "Female voice" },
      { voiceId: "shimmer", name: "Shimmer", description: "Soft female voice" }
    ];

    res.status(200).json({
      message: "Voices fetched successfully",
      voices: voices
    });
  } catch (error) {
    console.error("Error fetching voices:", error);
    res.status(500).json({ error: "Failed to fetch voices" });
  }
};