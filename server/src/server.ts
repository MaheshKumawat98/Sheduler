import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import socialAuthRoutes from './routes/socialAuthRoutes';
import accountRoutes from './routes/accountRoutes';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.send('Server is running');
});
app.use('/api/auth', authRoutes);
app.use('/api', socialAuthRoutes);
app.use('/api', accountRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
