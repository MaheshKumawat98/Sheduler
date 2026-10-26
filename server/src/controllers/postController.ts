import { Request, Response } from 'express';
import { UploadApiResponse } from 'cloudinary';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import Post from '../models/Post';
import Generation from '../models/Generation';
import cloudinary from '../config/cloudinary';

/**
 * Sleep helper for asynchronous delays (e.g. polling Leonardo API)
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper to upload buffer to Cloudinary via upload_stream
 */
const uploadBufferToCloudinary = (
  file: Express.Multer.File
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: 'social_media_posts',
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve(result);
      }
    );
    uploadStream.end(file.buffer);
  });
};

/**
 * @desc    Generate AI social media post (Gemini text + optional Leonardo image)
 * @route   POST /api/posts/generate
 * @access  Protected
 */
export const generatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { prompt, tone = 'professional', generateImage = false } = req.body;

    if (!prompt) {
      res.status(400).json({ message: 'Prompt is required' });
      return;
    }

    // STEP 1 — Gemini text generation
    const geminiApiKey = process.env.GEMINI_API_KEY || '';
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const geminiPrompt = `You are a social media expert. Generate a social media post for the following topic: ${prompt}. Tone: ${tone}. Return ONLY a valid JSON object with two fields: content (the post text with relevant hashtags) and imagePrompt (a detailed image generation prompt for this post). No extra text, no markdown.`;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: geminiPrompt,
    });

    let rawText = geminiResponse.text || '';
    rawText = rawText.replace(/```json\n?|\n?```/g, '').trim();

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      rawText = jsonMatch[0];
    }

    let parsedContent: { content: string; imagePrompt: string };
    try {
      parsedContent = JSON.parse(rawText);
    } catch {
      throw new Error(`Failed to parse Gemini response as JSON: ${rawText}`);
    }

    const { content, imagePrompt } = parsedContent;
    let mediaUrl: string | undefined;
    let mediaType: string | undefined;

    // STEP 2 & 3 & 4 — Leonardo image generation & Cloudinary upload (if generateImage is true)
    const shouldGenerateImage =
      generateImage === true || generateImage === 'true';

    if (shouldGenerateImage) {
      const leonardoApiKey = process.env.LEONARDO_API_KEY;
      if (!leonardoApiKey) {
        throw new Error('LEONARDO_API_KEY is not defined in environment');
      }

      // STEP 2 — Request generation
      const leoInitResponse = await axios.post(
        'https://cloud.leonardo.ai/api/rest/v1/generations',
        {
          prompt: imagePrompt || prompt,
          num_images: 1,
          width: 1024,
          height: 1024,
        },
        {
          headers: {
            Authorization: `Bearer ${leonardoApiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      const generationId =
        leoInitResponse.data?.sdGenerationJob?.generationId ||
        leoInitResponse.data?.generationId;

      if (!generationId) {
        throw new Error('Could not obtain generationId from Leonardo.ai API');
      }

      // STEP 3 — Poll Leonardo for completion (every 5 seconds, max 20 retries)
      let temporaryImageUrl: string | undefined;
      const maxRetries = 20;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        await sleep(5000);

        const pollResponse = await axios.get(
          `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
          {
            headers: {
              Authorization: `Bearer ${leonardoApiKey}`,
              Accept: 'application/json',
            },
          }
        );

        const genData =
          pollResponse.data?.generations_by_pk || pollResponse.data;
        const status = genData?.status;

        if (status === 'COMPLETE') {
          const generatedImages = genData?.generated_images || [];
          if (generatedImages.length > 0 && generatedImages[0].url) {
            temporaryImageUrl = generatedImages[0].url;
          }
          break;
        } else if (status === 'FAILED') {
          throw new Error('Leonardo.ai image generation status reported FAILED');
        }
      }

      // STEP 4 — Upload Leonardo image to Cloudinary
      if (temporaryImageUrl) {
        const uploadResult = await cloudinary.uploader.upload(temporaryImageUrl, {
          folder: 'social_media_ai',
        });
        mediaUrl = uploadResult.secure_url;
        mediaType = 'image';
      }
    }

    // STEP 5 — Save Generation document
    const generationDoc = await Generation.create({
      user: req.user._id,
      prompt,
      tone,
      content,
      ...(mediaUrl ? { mediaUrl, mediaType } : {}),
    });

    // STEP 6 — Return 200
    res.status(200).json({
      content,
      mediaUrl,
      generationId: generationDoc._id,
    });
  } catch (error) {
    console.error('Error in generatePost:', error);
    res.status(500).json({
      message: 'Server error generating post',
      error: error instanceof Error ? error.message : error,
    });
  }
};

/**
 * @desc    Schedule a new post
 * @route   POST /api/posts
 * @access  Protected
 */
export const schedulePost = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { content, scheduledFor } = req.body;
    let { platforms } = req.body;

    if (!content || !scheduledFor || !platforms) {
      res.status(400).json({
        message: 'Content, platforms, and scheduledFor time are required',
      });
      return;
    }

    // Parse platforms if passed as string (e.g. from FormData)
    if (typeof platforms === 'string') {
      try {
        platforms = JSON.parse(platforms);
      } catch {
        platforms = platforms.split(',').map((p: string) => p.trim());
      }
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      res.status(400).json({ message: 'At least one platform must be selected' });
      return;
    }

    let mediaUrl: string | undefined;
    let mediaType: 'image' | 'video' | undefined;

    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(req.file);
      mediaUrl = uploadResult.secure_url;
      mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      platforms,
      scheduledFor: new Date(scheduledFor),
      status: 'scheduled',
      ...(mediaUrl ? { mediaUrl } : {}),
      ...(mediaType ? { mediaType } : {}),
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error in schedulePost:', error);
    res.status(500).json({ message: 'Server error scheduling post' });
  }
};

/**
 * @desc    Get all scheduled and published posts for authenticated user
 * @route   GET /api/posts
 * @access  Protected
 */
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const posts = await Post.find({ user: req.user._id }).sort({ scheduledFor: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error in getPosts:', error);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
};
