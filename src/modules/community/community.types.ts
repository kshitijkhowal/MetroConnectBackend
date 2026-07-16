export type ContributorRow = {
  id: string;
  name: string;
  avatar: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Contributor = {
  name: string;
  avatar: string | null;
};

export type ContributorsResponse = {
  contributors: Contributor[];
  fetchedAt: string;
};
