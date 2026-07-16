import { supabaseAdmin } from '../../lib/supabase.js';
import { ApiError } from '../../utils/ApiError.js';
import type { ProfileRow } from '../auth/auth.types.js';

export async function getProfileById(userId: string): Promise<ProfileRow> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, error.message, 'PROFILE_FETCH_FAILED');
  }

  if (!data) {
    throw new ApiError(404, 'Profile not found', 'PROFILE_NOT_FOUND');
  }

  return data as ProfileRow;
}
