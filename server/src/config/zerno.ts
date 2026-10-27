import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const ZERNIO_BASE_URL = 'https://zernio.com/api/v1';
export const BASE_URL = ZERNIO_BASE_URL;

export const getHeaders = () => ({
  Authorization: process.env.ZERNIO_API_KEY || '',
  'Content-Type': 'application/json',
});

export const headers = {
  get Authorization() {
    return process.env.ZERNIO_API_KEY || '';
  },
  'Content-Type': 'application/json',
};

export const config = {
  baseURL: BASE_URL,
  headers,
};

/**
 * Get all profiles
 * GET /profiles
 */
export const getProfiles = async (): Promise<any> => {
  const response = await axios.get(`${ZERNIO_BASE_URL}/profiles`, {
    headers: getHeaders(),
  });
  return response.data;
};

/**
 * Create a new profile
 * POST /profiles
 */
export const createProfile = async (name: string): Promise<any> => {
  const response = await axios.post(
    `${ZERNIO_BASE_URL}/profiles`,
    { name },
    { headers: getHeaders() }
  );
  return response.data;
};

/**
 * Get OAuth connect URL for a platform
 * GET /connect/{platform}?profileId={profileId}&redirect_url={redirectUrl}
 */
export const getConnectUrl = async (
  profileId: string,
  platform: string,
  redirectUrl: string
): Promise<any> => {
  const response = await axios.get(
    `${ZERNIO_BASE_URL}/connect/${platform.toLowerCase()}`,
    {
      params: { profileId, redirect_url: redirectUrl },
      headers: getHeaders(),
    }
  );
  return response.data;
};

/**
 * List accounts connected to a profile
 * GET /accounts?profileId={profileId}
 */
export const listAccounts = async (profileId: string): Promise<any> => {
  const response = await axios.get(`${ZERNIO_BASE_URL}/accounts`, {
    params: { profileId },
    headers: getHeaders(),
  });
  return response.data;
};

/**
 * Disconnect/delete an account
 * DELETE /accounts/{accountId}
 */
export const deleteAccount = async (accountId: string): Promise<any> => {
  const response = await axios.delete(
    `${ZERNIO_BASE_URL}/accounts/${accountId}`,
    {
      headers: getHeaders(),
    }
  );
  return response.data;
};

/**
 * Create/publish a post
 * POST /posts
 */
export const createPost = async (payload: any): Promise<any> => {
  const response = await axios.post(`${ZERNIO_BASE_URL}/posts`, payload, {
    headers: getHeaders(),
  });
  return response.data;
};

export default {
  BASE_URL,
  ZERNIO_BASE_URL,
  headers,
  config,
  getHeaders,
  getProfiles,
  createProfile,
  getConnectUrl,
  listAccounts,
  deleteAccount,
  createPost,
};
