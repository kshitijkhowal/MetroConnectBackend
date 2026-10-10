import { supabaseAdmin } from '../../lib/supabase.js';
import { ApiError } from '../../utils/ApiError.js';
import type { AppConfigInput } from './appConfig.schema.js';
import {
  APP_CONFIG_ID,
  DEFAULT_APP_CONFIG,
  type AppConfig,
  type AppConfigRow,
} from './appConfig.types.js';

function mapAppConfig(row: AppConfigRow): AppConfig {
  return {
    android: {
      forceUpdate: row.android_force_update,
      latestVersion: row.android_latest_version,
      minimumVersion: row.android_minimum_version,
      updateUrl: row.android_update_url,
    },
    ios: {
      forceUpdate: row.ios_force_update,
      latestVersion: row.ios_latest_version,
      minimumVersion: row.ios_minimum_version,
      updateUrl: row.ios_update_url,
    },
    releasedAt: row.released_at,
    updateMessage: row.update_message,
    updateTitle: row.update_title,
  };
}

function toRow(input: AppConfigInput): Omit<AppConfigRow, 'created_at' | 'updated_at'> {
  let releasedAt: string | null = null;
  if (input.releasedAt && input.releasedAt.trim() !== '') {
    const parsed = new Date(input.releasedAt);
    if (Number.isNaN(parsed.getTime())) {
      throw new ApiError(400, 'releasedAt must be a valid date', 'VALIDATION_ERROR');
    }
    releasedAt = parsed.toISOString();
  }

  return {
    id: APP_CONFIG_ID,
    android_force_update: input.android.forceUpdate,
    android_latest_version: input.android.latestVersion,
    android_minimum_version: input.android.minimumVersion,
    android_update_url: input.android.updateUrl,
    ios_force_update: input.ios.forceUpdate,
    ios_latest_version: input.ios.latestVersion,
    ios_minimum_version: input.ios.minimumVersion,
    ios_update_url: input.ios.updateUrl,
    released_at: releasedAt,
    update_message: input.updateMessage,
    update_title: input.updateTitle,
  };
}

export async function getAppConfig(): Promise<AppConfig> {
  const { data, error } = await supabaseAdmin
    .from('app_config')
    .select('*')
    .eq('id', APP_CONFIG_ID)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, error.message, 'APP_CONFIG_FETCH_FAILED');
  }

  if (!data) {
    return DEFAULT_APP_CONFIG;
  }

  return mapAppConfig(data as AppConfigRow);
}

export async function upsertAppConfig(input: AppConfigInput): Promise<AppConfig> {
  const row = toRow(input);

  const { data, error } = await supabaseAdmin
    .from('app_config')
    .upsert(row, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    throw new ApiError(500, error.message, 'APP_CONFIG_SAVE_FAILED');
  }

  return mapAppConfig(data as AppConfigRow);
}
