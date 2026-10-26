import { Request, Response } from 'express';
import { UploadApiResponse } from 'cloudinary';
import Post from '../models/Post';
import cloudinary from '../config/cloudinary';

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
