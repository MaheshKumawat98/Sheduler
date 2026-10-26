import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'default_jwt_secret';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: '7d',
  });
};
