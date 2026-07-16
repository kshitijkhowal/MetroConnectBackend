import { supabaseAdmin } from '../../lib/supabase.js';
import { ApiError } from '../../utils/ApiError.js';
import type {
  PaginationMeta,
  ReleaseFeature,
  ReleaseNote,
  ReleaseNoteRow,
} from './releaseNotes.types.js';

function mapIcons(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter((item): item is string => typeof item === 'string');
}

function mapFeatures(raw: unknown): ReleaseFeature[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item, index) => {
    const feature = (item ?? {}) as Partial<ReleaseFeature>;
    return {
      id: typeof feature.id === 'number' ? feature.id : index + 1,
      title: typeof feature.title === 'string' ? feature.title : '',
    };
  });
}

function mapReleaseNote(row: ReleaseNoteRow): ReleaseNote {
  return {
    version: row.version,
    versionCode: row.version_code,
    releaseDate: row.release_date,
    icons: mapIcons(row.icons),
    features: mapFeatures(row.features),
  };
}

function buildPagination(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
}

export async function listReleaseNotes(
  page: number,
  limit: number,
): Promise<{ releaseNotes: ReleaseNote[]; pagination: PaginationMeta }> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from('release_notes')
    .select('*', { count: 'exact' })
    .order('version_code', { ascending: false })
    .range(from, to);

  if (error) {
    throw new ApiError(500, error.message, 'RELEASE_NOTES_FETCH_FAILED');
  }

  const total = count ?? 0;
  return {
    releaseNotes: (data ?? []).map((row) => mapReleaseNote(row as ReleaseNoteRow)),
    pagination: buildPagination(page, limit, total),
  };
}

export async function getReleaseNoteByVersionCode(versionCode: number): Promise<ReleaseNote> {
  const { data, error } = await supabaseAdmin
    .from('release_notes')
    .select('*')
    .eq('version_code', versionCode)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, error.message, 'RELEASE_NOTE_FETCH_FAILED');
  }

  if (!data) {
    throw new ApiError(404, 'Release note not found', 'RELEASE_NOTE_NOT_FOUND');
  }

  return mapReleaseNote(data as ReleaseNoteRow);
}
