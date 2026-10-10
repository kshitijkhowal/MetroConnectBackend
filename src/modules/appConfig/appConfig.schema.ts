import { z, ZodError } from 'zod';
import { ApiError } from '../../utils/ApiError.js';

const versionSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+){1,3}$/, 'Use a version like 1.6.1');

const platformSchema = z.object({
  forceUpdate: z.boolean(),
  latestVersion: versionSchema,
  minimumVersion: versionSchema,
  updateUrl: z.union([z.string().trim().url(), z.literal('')]),
});

export const appConfigSchema = z.object({
  android: platformSchema,
  ios: platformSchema,
  releasedAt: z.union([z.string().trim().min(1), z.null()]).optional(),
  updateMessage: z.string().trim().min(1),
  updateTitle: z.string().trim().min(1),
});

export type AppConfigInput = z.infer<typeof appConfigSchema>;

export function parseAppConfig(body: unknown): AppConfigInput {
  const parsed = appConfigSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(400, formatZodError(parsed.error), 'VALIDATION_ERROR');
  }

  return parsed.data;
}

function formatZodError(err: ZodError): string {
  const message = err.issues
    .map((issue) => {
      const path = issue.path.join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join('; ');

  return message || 'Validation failed';
}
