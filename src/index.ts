import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`[metroconnect-backend] listening on http://localhost:${env.PORT}`);
});
