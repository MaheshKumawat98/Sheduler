import { Request, Response } from 'express';
import ActivityLog from '../models/ActivityLog';

/**
 * @desc    Get recent activity logs for authenticated user
 * @route   GET /api/activity
 * @access  Protected
 */
export const getActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const activities = await ActivityLog.find({ user: req.user._id })
      .populate('relatedPost', '_id content platforms status')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json(activities);
  } catch (error) {
    console.error('Error in getActivity:', error);
    res.status(500).json({ message: 'Server error retrieving activity logs' });
  }
};
