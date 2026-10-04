import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import app from './app.js';
import { connectDatabase } from './config/db.js';

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });

const port = Number(process.env.PORT || 5000);

async function startServer() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`Speakora backend listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error(`Unable to start Speakora backend: ${error.message}`);
  process.exitCode = 1;
});
