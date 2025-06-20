import { GoogleGenAI } from "@google/genai";
import { Request, Response } from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import dotenv from "dotenv";
import * as cheerio from "cheerio";

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

// Extract text from URLs
const extractTextFromUrl = async (url: string): Promise<string> => {
  try {
    // Validate URL format
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      throw new Error('Invalid URL format');
    }

    // Ensure URL has protocol
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Fetch the webpage with timeout and user agent
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(formattedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} error accessing: ${url}`);
    }
    
    const html = await response.text();

    // Parse HTML content
    const $ = cheerio.load(html);
    
    // Remove script and style elements
    $('script, style, nav, header, footer, aside').remove();
    
    // Extract title
    const title = $('title').text().trim() || 'No title found';
    
    // Extract main content - try multiple selectors
    let mainContent = '';
    const contentSelectors = [
      'article',
      '[role="main"]',
      'main',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '#content',
      '.main-content'
    ];
    
    for (const selector of contentSelectors) {
      const content = $(selector).text().trim();
      if (content && content.length > mainContent.length) {
        mainContent = content;
      }
    }
    
    // Fallback to body content if no main content found
    if (!mainContent) {
      mainContent = $('body').text().trim();
    }
    
    // Clean up the text
    const cleanedContent = mainContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    // Limit content length to prevent overwhelming the AI
    const maxLength = 10000; // Adjust as needed
    const truncatedContent = cleanedContent.length > maxLength 
      ? cleanedContent.substring(0, maxLength) + '...[content truncated]'
      : cleanedContent;
    
    return `Title: ${title}\n\nContent:\n${truncatedContent}`;
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout for URL: ${url}`);
    } else if (error.code === 'ENOTFOUND') {
      throw new Error(`URL not found: ${url}`);
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error(`Connection refused: ${url}`);
    } else {
      throw new Error(`Failed to fetch content from ${url}: ${error.message}`);
    }
  }
};

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

// Validate and parse URLs from request
const parseUrls = (urlsInput: string | string[]): string[] => {
  if (!urlsInput) return [];
  
  const urlsArray = Array.isArray(urlsInput) ? urlsInput : [urlsInput];
  return urlsArray
    .flatMap(url => url.split(/[,\s]+/)) // Split by comma or whitespace
    .map(url => url.trim())
    .filter(url => url.length > 0);
};

// Main podcast generation endpoint
export const generateContent = async (req: Request, res: Response) => {
  try {
    const { prompt, urls } = req.body;
    
    if (!prompt) {
       res.status(400).json({ 
        error: "Prompt is required" 
      });
    }

    let sourceContent = '';
    let processedFiles = 0;
    let processedUrls = 0;
    const errors: string[] = [];
    
    // Process URLs if provided
    if (urls) {
      const urlList = parseUrls(urls);
      const urlContents: string[] = [];
      
      for (const url of urlList) {
        try {
          const extractedText = await extractTextFromUrl(url);
          urlContents.push(`\n=== Content from ${url} ===\n${extractedText}\n=== End of ${url} ===\n`);
          processedUrls++;
        } catch (error: any) {
          console.error(`Error processing URL ${url}:`, error.message);
          errors.push(`Failed to process ${url}: ${error.message}`);
        }
      }
      
      if (urlContents.length > 0) {
        sourceContent += `\n\nWeb Content:\n${urlContents.join('\n')}`;
      }
    }
    
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
        } catch (error: any) {
          console.error(`Error processing file ${file.originalname}:`, error.message);
          errors.push(`Failed to process ${file.originalname}: ${error.message}`);
        }
      }
      
      if (fileTexts.length > 0) {
        sourceContent += `\n\nFile Content:\n${fileTexts.join('\n')}`;
      }
    }

    // Create the full prompt for podcast generation
    const fullPrompt = `
Create an engaging podcast script based on the following request: "${prompt}"

${sourceContent}

Requirements:
- Format as a professional podcast script with clear chapters/segments
- Include engaging dialogue and natural conversation flow
- Add timestamps and segment headings
- Make it informative yet entertaining
- Include intro, main content sections, and conclusion
- Use conversational tone suitable for audio format
- If multiple sources are provided, synthesize information from all sources
- Cite or reference the sources naturally in the conversation

Generate a complete podcast script now:
`;

    // Generate podcast script using Gemini 2.0 Flash
    const podcastResponse = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullPrompt,
    });
    const podcastScript = podcastResponse.candidates?.[0]?.content?.parts?.[0]?.text || "No script generated.";

    // Prepare response message
    const sourcesProcessed = [];
    if (processedFiles > 0) sourcesProcessed.push(`${processedFiles} file(s)`);
    if (processedUrls > 0) sourcesProcessed.push(`${processedUrls} URL(s)`);
    
    const message = sourcesProcessed.length > 0 
      ? `Podcast script generated from your prompt and ${sourcesProcessed.join(' and ')}`
      : "Podcast script generated from your prompt";

    // Return the generated podcast script
    res.status(200).json({
      success: true,
      data: podcastScript,
      filesProcessed: processedFiles,
      urlsProcessed: processedUrls,
      errors: errors.length > 0 ? errors : undefined,
      message
    });


  } catch (error: any) {
    console.error("Error generating podcast:", error);
    res.status(500).json({ 
      error: "Failed to generate podcast script",
      details: error.message 
    });
  }
};