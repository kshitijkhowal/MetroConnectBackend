export type ReleaseFeature = {
  id: number;
  icon: string;
  title: string;
};

export type ReleaseNoteRow = {
  id: string;
  version: string;
  version_code: number;
  release_date: string | null;
  features: ReleaseFeature[];
  created_at: string;
  updated_at: string;
};

export type ReleaseNote = {
  version: string;
  versionCode: number;
  releaseDate: string | null;
  features: ReleaseFeature[];
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ReleaseNotesListResponse = {
  releaseNotes: ReleaseNote[];
  pagination: PaginationMeta;
};
