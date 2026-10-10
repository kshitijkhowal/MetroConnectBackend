import app from './app.js';
import { env } from './config/env.js';

export default app;

if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`[metroconnect-backend] listening on http://localhost:${env.PORT}`);
  });
}
