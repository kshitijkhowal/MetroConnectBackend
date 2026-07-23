import { supabaseAdmin } from '../../lib/supabase.js';
import { ApiError } from '../../utils/ApiError.js';
import type { Contributor, Developer } from '../community/community.types.js';
import type { ReleaseFeature, ReleaseNote } from '../releaseNotes/releaseNotes.types.js';
import * as communityService from '../community/community.service.js';
import * as releaseNotesService from '../releaseNotes/releaseNotes.service.js';

export type CreateContributorInput = {
  name: string;
  avatar?: string | null;
  sortOrder?: number;
};

export type CreateDeveloperInput = {
  name: string;
  avatar?: string | null;
  positions: string[];
  sortOrder?: number;
};

export type CreateReleaseNoteInput = {
  version: string;
  versionCode: number;
  releaseDate?: string | null;
  icons?: string[];
  features: ReleaseFeature[];
};

export type UpdateReleaseNoteInput = CreateReleaseNoteInput;

function mapReleaseNoteRow(data: Record<string, unknown>, fallbackFeatures: ReleaseFeature[]): ReleaseNote {
  return {
    version: data.version as string,
    versionCode: data.version_code as number,
    releaseDate: (data.release_date as string | null) ?? null,
    icons: Array.isArray(data.icons)
      ? (data.icons as unknown[]).filter((i): i is string => typeof i === 'string')
      : [],
    features: Array.isArray(data.features)
      ? (data.features as ReleaseFeature[])
      : fallbackFeatures,
  };
}

function normalizeReleaseNoteFields(input: CreateReleaseNoteInput) {
  const features = input.features
    .map((f, index) => ({
      id: typeof f.id === 'number' ? f.id : index + 1,
      title: f.title.trim(),
    }))
    .filter((f) => f.title.length > 0);

  if (features.length === 0) {
    throw new ApiError(400, 'At least one feature title is required', 'VALIDATION_ERROR');
  }

  return {
    features,
    icons: (input.icons ?? []).map((i) => i.trim()).filter(Boolean),
    releaseDate: input.releaseDate?.trim() ? input.releaseDate.trim() : null,
  };
}

async function nextSortOrder(table: 'community_contributors' | 'community_developers'): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, error.message, 'SORT_ORDER_FETCH_FAILED');
  }

  return (data?.sort_order ?? -1) + 1;
}

export async function listPeople(): Promise<{
  contributors: Contributor[];
  developers: Developer[];
}> {
  const [contributors, developers] = await Promise.all([
    communityService.listContributors(),
    communityService.listDevelopers(),
  ]);

  return { contributors, developers };
}

export async function createContributor(input: CreateContributorInput): Promise<Contributor> {
  const sortOrder = input.sortOrder ?? (await nextSortOrder('community_contributors'));

  const { data, error } = await supabaseAdmin
    .from('community_contributors')
    .insert({
      name: input.name,
      avatar: input.avatar ?? null,
      sort_order: sortOrder,
    })
    .select('*')
    .single();

  if (error) {
    throw new ApiError(500, error.message, 'CONTRIBUTOR_CREATE_FAILED');
  }

  return {
    name: data.name as string,
    avatar: (data.avatar as string | null) ?? null,
  };
}

export async function createDeveloper(input: CreateDeveloperInput): Promise<Developer> {
  const sortOrder = input.sortOrder ?? (await nextSortOrder('community_developers'));
  const positions = input.positions.map((p) => p.trim()).filter(Boolean);

  if (positions.length === 0) {
    throw new ApiError(400, 'At least one position is required', 'VALIDATION_ERROR');
  }

  const { data, error } = await supabaseAdmin
    .from('community_developers')
    .insert({
      name: input.name,
      avatar: input.avatar ?? null,
      positions,
      sort_order: sortOrder,
    })
    .select('*')
    .single();

  if (error) {
    throw new ApiError(500, error.message, 'DEVELOPER_CREATE_FAILED');
  }

  return {
    name: data.name as string,
    avatar: (data.avatar as string | null) ?? null,
    positions: Array.isArray(data.positions)
      ? (data.positions as unknown[]).filter((p): p is string => typeof p === 'string')
      : [],
  };
}

export async function listReleaseNotes(page: number, limit: number) {
  return releaseNotesService.listReleaseNotes(page, limit);
}

export async function createReleaseNote(input: CreateReleaseNoteInput): Promise<ReleaseNote> {
  const { features, icons, releaseDate } = normalizeReleaseNoteFields(input);

  const { data, error } = await supabaseAdmin
    .from('release_notes')
    .insert({
      version: input.version,
      version_code: input.versionCode,
      release_date: releaseDate,
      icons,
      features,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new ApiError(409, 'A release note with this version or version code already exists', 'RELEASE_NOTE_CONFLICT');
    }
    throw new ApiError(500, error.message, 'RELEASE_NOTE_CREATE_FAILED');
  }

  return mapReleaseNoteRow(data as Record<string, unknown>, features);
}

export async function updateReleaseNote(
  currentVersionCode: number,
  input: UpdateReleaseNoteInput,
): Promise<ReleaseNote> {
  const { features, icons, releaseDate } = normalizeReleaseNoteFields(input);

  const { data, error } = await supabaseAdmin
    .from('release_notes')
    .update({
      version: input.version,
      version_code: input.versionCode,
      release_date: releaseDate,
      icons,
      features,
    })
    .eq('version_code', currentVersionCode)
    .select('*')
    .maybeSingle();

  if (error) {
    if (error.code === '23505') {
      throw new ApiError(409, 'A release note with this version or version code already exists', 'RELEASE_NOTE_CONFLICT');
    }
    throw new ApiError(500, error.message, 'RELEASE_NOTE_UPDATE_FAILED');
  }

  if (!data) {
    throw new ApiError(404, 'Release note not found', 'RELEASE_NOTE_NOT_FOUND');
  }

  return mapReleaseNoteRow(data as Record<string, unknown>, features);
}
