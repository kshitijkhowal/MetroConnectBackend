import { supabaseAdmin } from '../../lib/supabase.js';
import { ApiError } from '../../utils/ApiError.js';
import type {
  Contributor,
  ContributorRow,
  Developer,
  DeveloperRow,
} from './community.types.js';

function mapContributor(row: ContributorRow): Contributor {
  return {
    name: row.name,
    avatar: row.avatar,
  };
}

function mapPositions(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter((item): item is string => typeof item === 'string');
}

function mapDeveloper(row: DeveloperRow): Developer {
  return {
    name: row.name,
    avatar: row.avatar,
    positions: mapPositions(row.positions),
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

export async function listDevelopers(): Promise<Developer[]> {
  const { data, error } = await supabaseAdmin
    .from('community_developers')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw new ApiError(500, error.message, 'DEVELOPERS_FETCH_FAILED');
  }

  return (data ?? []).map((row) => mapDeveloper(row as DeveloperRow));
}
