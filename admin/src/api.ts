const SECRET_KEY = 'mc_admin_secret';

export function getAdminSecret(): string | null {
  return localStorage.getItem(SECRET_KEY);
}

export function setAdminSecret(secret: string): void {
  localStorage.setItem(SECRET_KEY, secret);
}

export function clearAdminSecret(): void {
  localStorage.removeItem(SECRET_KEY);
}

type ApiErrorBody = {
  error?: {
    message?: string;
    code?: string;
  };
};

export async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error('Admin secret is not set');
  }

  const headers = new Headers(options.headers);
  headers.set('X-Admin-Secret', secret);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(path, { ...options, headers });
  const data = (await res.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!res.ok) {
    throw new Error(data.error?.message ?? `Request failed (${res.status})`);
  }

  return data;
}
