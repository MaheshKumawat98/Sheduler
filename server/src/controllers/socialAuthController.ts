import { Request, Response } from 'express';
import User from '../models/User';
import Account from '../models/Account';
import zerno from '../config/zerno';

/**
 * Helper function to get or create a Zerno profile for a user
 */
export const getOrCreateZernoProfile = async (userId: string): Promise<any> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // If user already has a zernoProfileId, attempt to fetch that profile
  if (user.zernoProfileId) {
    try {
      const existing = await zerno.profiles.getProfile({
        path: { profileId: user.zernoProfileId },
      });
      if (existing.data?.profile) {
        return existing.data.profile;
      }
      return existing.data || { _id: user.zernoProfileId };
    } catch (error) {
      console.warn('Could not retrieve existing Zerno profile, returning stored profileId:', error);
      return { _id: user.zernoProfileId };
    }
  }

  // Otherwise, create a new Zerno profile
  const profileResponse = await zerno.profiles.createProfile({
    body: {
      name: user.name || `User ${user._id}`,
    },
  });

  const createdProfile = profileResponse.data?.profile || (profileResponse.data as any);
  const newProfileId = createdProfile?._id || (createdProfile as any)?.id;

  if (newProfileId) {
    user.zernoProfileId = newProfileId;
    await user.save();
  }

  return createdProfile;
};

/**
 * @desc    Get OAuth connect URL for a specific platform
 * @route   GET /api/oauth/:platform/url
 * @access  Protected
 */
export const getOAuthUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPlatform = req.params.platform;
    const platform = Array.isArray(rawPlatform) ? rawPlatform[0] : rawPlatform;

    if (!platform) {
      res.status(400).json({ message: 'Platform is required' });
      return;
    }

    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const profile = await getOrCreateZernoProfile(req.user._id);
    const zernoProfileId = profile?._id || profile?.id;

    if (!zernoProfileId) {
      res.status(500).json({ message: 'Failed to retrieve or create Zerno profile' });
      return;
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const redirectUrl = `${clientUrl}/accounts`;

    const response = await (zerno.connect.getConnectUrl as any)({
      path: {
        platform: platform.toLowerCase(),
      },
      query: {
        profileId: zernoProfileId,
        redirect_url: redirectUrl,
      },
    });

    const url =
      response.data?.authUrl ||
      (response.data as any)?.url ||
      (response as any)?.authUrl ||
      (response as any)?.url;

    if (!url) {
      res.status(500).json({
        message: 'Failed to generate OAuth connect URL',
        error: response.error || response.data,
      });
      return;
    }

    res.status(200).json({ url });
  } catch (error) {
    console.error('Error in getOAuthUrl:', error);
    res.status(500).json({ message: 'Server error generating OAuth URL' });
  }
};

/**
 * @desc    Sync connected social accounts from Zerno to MongoDB
 * @route   GET /api/oauth/sync
 * @access  Protected
 */
export const syncAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const profile = await getOrCreateZernoProfile(req.user._id);
    const zernoProfileId = profile?._id || profile?.id;

    if (!zernoProfileId) {
      res.status(500).json({ message: 'Failed to retrieve or create Zerno profile' });
      return;
    }

    const response = await zerno.accounts.listAccounts({
      query: {
        profileId: zernoProfileId,
      },
    });

    const zernoAccounts: any[] =
      response.data?.accounts ||
      (response as any)?.accounts ||
      (Array.isArray(response.data) ? response.data : []);

    for (const acc of zernoAccounts) {
      const zernoAccountId = acc._id || acc.id;
      if (!zernoAccountId) continue;

      const normalizedPlatform = (acc.platform || '').toLowerCase();
      const handle = acc.username || acc.displayName || acc.handle || 'account';
      const avatarUrl = acc.avatarUrl || acc.profilePicture;

      await Account.findOneAndUpdate(
        { zernoAccountId },
        {
          user: req.user._id,
          platform: normalizedPlatform,
          handle,
          zernoAccountId,
          status: 'connected',
          ...(avatarUrl ? { avatarUrl } : {}),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const updatedAccounts = await Account.find({ user: req.user._id });
    res.status(200).json(updatedAccounts);
  } catch (error) {
    console.error('Error in syncAccounts:', error);
    res.status(500).json({ message: 'Server error syncing accounts' });
  }
};
