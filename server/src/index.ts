import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { createApp } from './app';

const port = parseInt(process.env.PORT || '3001', 10);
const app = createApp();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});










