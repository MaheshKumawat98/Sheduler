import Zernio from '@zernio/node';
import dotenv from 'dotenv';

dotenv.config();

const zernoApiKey = process.env.ZERNO_API_KEY || '';

export const zerno = new Zernio({
  apiKey: zernoApiKey,
});

export default zerno;
