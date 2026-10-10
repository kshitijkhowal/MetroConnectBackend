import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CORS_ORIGIN: z.string().default('*'),
  /** Required for /api/admin/* — keep local-only; leave unset in production. */
  ADMIN_SECRET: z.string().min(8).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const fields = Object.keys(parsed.error.flatten().fieldErrors).join(', ');
  throw new Error(`[env] Invalid environment variables: ${fields}`);
}

export const env = parsed.data;
