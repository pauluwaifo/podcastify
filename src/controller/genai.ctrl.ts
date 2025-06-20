import { GoogleGenAI } from "@google/genai";
import { Request, Response } from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenAI({apiKey: process.env.GOOGLE_GENAI_API_KEY!});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['.pdf', '.txt', '.md'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, TXT, and MD files are allowed'), false);
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Extract text from uploaded files
const extractTextFromFile = async (filePath: string): Promise<string> => {
  const fileExtension = path.extname(filePath).toLowerCase();
  
  try {
    switch (fileExtension) {
      case '.pdf':
        const pdfBuffer = await fs.readFile(filePath);
        const pdfData = await pdf(pdfBuffer);
        return pdfData.text;
        
      case '.txt':
      case '.md':
        return await fs.readFile(filePath, 'utf-8');
        
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  } catch (error) {
    throw new Error(`Failed to extract text from file: ${error}`);
  }
};

// Main podcast generation endpoint
export const generateContent = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
       res.status(400).json({ 
        error: "Prompt is required" 
      });
    }

    let fileContent = '';
    let processedFiles = 0;
    
    // Process uploaded files if any
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const fileTexts: string[] = [];
      
      for (const file of req.files) {
        try {
          const extractedText = await extractTextFromFile(file.path);
          fileTexts.push(`\n=== Content from ${file.originalname} ===\n${extractedText}\n=== End of ${file.originalname} ===\n`);
          processedFiles++;
          
          // Clean up uploaded file
          await fs.unlink(file.path);
        } catch (error) {
          console.error(`Error processing file ${file.originalname}:`, error);
        }
      }
      
      if (fileTexts.length > 0) {
        fileContent = `\n\nSource Material:\n${fileTexts.join('\n')}`;
      }
    }

    // Create the full prompt for podcast generation
    const fullPrompt = `
Create an engaging podcast script based on the following request: "${prompt}"

${fileContent}

Requirements:
- Format as a professional podcast script with clear chapters/segments
- Include engaging dialogue and natural conversation flow
- Add timestamps and segment headings
- Make it informative yet entertaining
- Include intro, main content sections, and conclusion
- Use conversational tone suitable for audio format

Generate a complete podcast script now:
`;

    // Generate podcast script using Gemini 2.0 Flash
    const podcastResponse = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullPrompt,
    });
    const podcastScript = podcastResponse.candidates?.[0]?.content?.parts?.[0]?.text || "No script generated.";


    // Return the generated podcast script
    res.status(200).json({
      success: true,
      data: podcastScript,
      filesProcessed: processedFiles,
      message: processedFiles > 0 
        ? `Podcast script generated from your prompt and ${processedFiles} uploaded file(s)`
        : "Podcast script generated from your prompt"
    });

    console.log(podcastScript)

  } catch (error: any) {
    console.error("Error generating podcast:", error);
    res.status(500).json({ 
      error: "Failed to generate podcast script",
      details: error.message 
    });
  }
};