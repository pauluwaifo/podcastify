import { NextFunction, Request, Response } from "express";


export const generateAudio = async (req: Request, res: Response, next: NextFunction) => {
  const { text, voice = "default", rate = 1.0, pitch = 1.0 } = req.body;

  try {
    // Return structured data for client-side synthesis
    res.status(200).json({
      success: true,
      audioConfig: {
        text,
        voice,
        rate,
        pitch,
        // Instructions for client
        synthesisMethod: "webSpeechAPI"
      },
      clientScript: `
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance("${text.replace(/"/g, '\\"')}");
        
        // Find and set the voice
        const voices = synth.getVoices();
        const selectedVoice = voices.find(v => 
          v.name.toLowerCase().includes("${voice}") || 
          v.lang.includes("${voice}")
        ) || voices[0];
        
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.rate = ${rate};
        utterance.pitch = ${pitch};
        
        synth.speak(utterance);
      `
    });
  } catch (error) {
    console.error("Error generating audio config:", error);
    res.status(500).json({ error: "Failed to generate audio configuration" });
  }
};

export const getVoices = async (req: Request, res: Response) => {
  try {
    // Return common voice options that work across devices
    const voices = [
      { voiceId: "default", name: "Default", description: "System default voice", lang: "en-US" },
      { voiceId: "google", name: "Google", description: "Google voice (if available)", lang: "en-US" },
      { voiceId: "microsoft", name: "Microsoft", description: "Microsoft voice (if available)", lang: "en-US" },
      { voiceId: "apple", name: "Apple", description: "Apple voice (if available)", lang: "en-US" },
      { voiceId: "en-gb", name: "British English", description: "British accent", lang: "en-GB" },
      { voiceId: "en-au", name: "Australian English", description: "Australian accent", lang: "en-AU" },
      { voiceId: "female", name: "Female Voice", description: "Prefer female voice", lang: "en-US" },
      { voiceId: "male", name: "Male Voice", description: "Prefer male voice", lang: "en-US" }
    ];

    res.status(200).json({
      message: "Voices fetched successfully",
      voices: voices,
      note: "Actual available voices depend on the client device and browser"
    });
  } catch (error) {
    console.error("Error fetching voices:", error);
    res.status(500).json({ error: "Failed to fetch voices" });
  }
};

export const generateAudioServerSide = async (req: Request, res: Response, next: NextFunction) => {
  const { text, voice = "default" } = req.body;

  try {
    const { exec } = require('child_process');
    const fs = require('fs');
    const path = require('path');
    
    const tempFile = path.join('/tmp', `tts_${Date.now()}.wav`);
    
    const command = `echo "${text.replace(/"/g, '\\"')}" | festival --tts --pipe > ${tempFile}`;
    
    exec(command, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error('Festival TTS error:', error);
        return res.status(500).json({ error: 'TTS generation failed' });
      }
      
      // Send the audio file
      res.setHeader('Content-Type', 'audio/wav');
      const audioStream = fs.createReadStream(tempFile);
      
      audioStream.pipe(res);
      
      audioStream.on('end', () => {
        fs.unlink(tempFile, (err: any) => {
          if (err) console.error('Failed to delete temp file:', err);
        });
      });
    });
    
  } catch (error) {
    console.error("Server-side TTS error:", error);
    res.status(500).json({ error: "Server-side TTS failed" });
  }
};