import { Request, Response } from 'express';
import Account from '../models/Account';
import zerno from '../config/zerno';

/**
 * @desc    Get all connected accounts for the authenticated user
 * @route   GET /api/accounts
 * @access  Protected
 */
export const getAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const accounts = await Account.find({ user: req.user._id });
    res.status(200).json(accounts);
  } catch (error) {
    console.error('Error in getAccounts:', error);
    res.status(500).json({ message: 'Server error retrieving accounts' });
  }
};

/**
 * @desc    Disconnect/delete an account
 * @route   DELETE /api/accounts/:id
 * @access  Protected
 */
export const disconnectAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const rawId = req.params.id;
    const accountId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!accountId) {
      res.status(400).json({ message: 'Account ID is required' });
      return;
    }

    // Ownership check: Find Account by _id AND user === req.user._id
    const account = await Account.findOne({ _id: accountId, user: req.user._id });

    if (!account) {
      res.status(404).json({ message: 'Account not found' });
      return;
    }

    // Call Zerno to delete the account
    if (account.zernoAccountId) {
      try {
        await (zerno.accounts.deleteAccount as any)({
          path: {
            accountId: account.zernoAccountId,
          },
          accountId: account.zernoAccountId,
        });
      } catch (zernoErr) {
        console.warn('Warning: Could not delete account on Zerno SDK:', zernoErr);
      }
    }

    // Delete the Account document from MongoDB
    await Account.findByIdAndDelete(account._id);

    res.status(200).json({ message: 'Account disconnected successfully' });
  } catch (error) {
    console.error('Error in disconnectAccount:', error);
    res.status(500).json({ message: 'Server error disconnecting account' });
  }
};
