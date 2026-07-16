export type ReleaseFeature = {
  id: number;
  title: string;
};

export type ReleaseNoteRow = {
  id: string;
  version: string;
  version_code: number;
  release_date: string | null;
  icons: string[];
  features: ReleaseFeature[];
  created_at: string;
  updated_at: string;
};

export type ReleaseNote = {
  version: string;
  versionCode: number;
  releaseDate: string | null;
  icons: string[];
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
