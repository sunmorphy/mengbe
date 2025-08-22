import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import categoriesRouter from './routes/categories';
import artworksRouter from './routes/artworks';
import projectsRouter from './routes/projects';
import authRouter from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());

// Apply JSON and URL-encoded parsing only to non-file-upload routes
app.use('/api/auth', express.json({ limit: '25mb' }));
app.use('/api/auth', express.urlencoded({ extended: true, limit: '25mb' }));
app.use('/api/categories', express.json({ limit: '25mb' }));
app.use('/api/categories', express.urlencoded({ extended: true, limit: '25mb' }));

app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/artworks', artworksRouter);
app.use('/api/projects', projectsRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'Meng CMS API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});