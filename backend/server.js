import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';

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
