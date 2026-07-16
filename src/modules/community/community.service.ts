import { supabaseAdmin } from '../../lib/supabase.js';
import { ApiError } from '../../utils/ApiError.js';
import type { Contributor, ContributorRow } from './community.types.js';

function mapContributor(row: ContributorRow): Contributor {
  return {
    name: row.name,
    avatar: row.avatar,
  };
}

export async function listContributors(): Promise<Contributor[]> {
  const { data, error } = await supabaseAdmin
    .from('community_contributors')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw new ApiError(500, error.message, 'CONTRIBUTORS_FETCH_FAILED');
  }

  return (data ?? []).map((row) => mapContributor(row as ContributorRow));
}
