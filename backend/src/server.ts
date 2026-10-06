/**
 * Server Entry Point
 * Starts the Express server
 */
import { config } from './config/env.ts';
import { connectDB } from './config/db.ts';
import { createApp } from './app.ts';

async function startServer() {
  await connectDB();

  const app = await createApp();
  const PORT = config.port;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[backend: server] SkillNexus AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
