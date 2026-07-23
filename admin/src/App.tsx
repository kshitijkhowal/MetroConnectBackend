import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  adminFetch,
  clearAdminSecret,
  getAdminSecret,
  setAdminSecret,
} from './api';

type Tab = 'people' | 'contributor' | 'developer' | 'releases';

type Contributor = {
  name: string;
  avatar: string | null;
};

type Developer = {
  name: string;
  avatar: string | null;
  positions: string[];
};

type ReleaseFeature = {
  id: number;
  title: string;
};

type ReleaseNote = {
  version: string;
  versionCode: number;
  releaseDate: string | null;
  icons: string[];
  features: ReleaseFeature[];
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function Avatar({ name, src }: { name: string; src: string | null }) {
  if (src) {
    return <img className="avatar" src={src} alt={name} />;
  }
  return <div className="avatar">{initials(name)}</div>;
}

function LoginGate({ onUnlock }: { onUnlock: () => void }) {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAdminSecret(secret.trim());

    try {
      await adminFetch('/api/admin/people');
      onUnlock();
    } catch (err) {
      clearAdminSecret();
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card form" onSubmit={handleSubmit}>
        <div>
          <h1>MetroConnect Admin</h1>
          <p className="muted">Local use only. Enter the `ADMIN_SECRET` from your backend `.env`.</p>
        </div>
        <label>
          Admin secret
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="local-admin-secret"
            autoFocus
            required
            minLength={8}
          />
        </label>
        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Checking…' : 'Unlock dashboard'}
        </button>
        {error ? <p className="status error">{error}</p> : null}
      </form>
    </div>
  );
}

function PeoplePanel() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<{
        contributors: Contributor[];
        developers: Developer[];
      }>('/api/admin/people');
      setContributors(data.contributors);
      setDevelopers(data.developers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load people');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="panel">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2>People</h2>
          <p className="muted">View community contributors and developers.</p>
        </div>
        <button className="ghost" type="button" onClick={() => void load()}>
          Refresh
        </button>
      </div>

      {loading ? <p className="muted">Loading…</p> : null}
      {error ? <p className="status error">{error}</p> : null}

      {!loading && !error ? (
        <div className="grid-2">
          <div>
            <h3>Developers ({developers.length})</h3>
            <div className="card-list">
              {developers.map((person) => (
                <article className="person-card" key={`dev-${person.name}`}>
                  <Avatar name={person.name} src={person.avatar} />
                  <div>
                    <h3>{person.name}</h3>
                    <div className="tags">
                      {person.positions.map((position) => (
                        <span className="tag" key={position}>
                          {position}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h3>Contributors ({contributors.length})</h3>
            <div className="card-list">
              {contributors.map((person) => (
                <article className="person-card" key={`con-${person.name}`}>
                  <Avatar name={person.name} src={person.avatar} />
                  <div>
                    <h3>{person.name}</h3>
                    <p>Community contributor</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function AddContributorPanel() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setError(null);

    try {
      await adminFetch('/api/admin/contributors', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          avatar: avatar.trim() || null,
        }),
      });
      setStatus(`Added contributor “${name.trim()}”`);
      setName('');
      setAvatar('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contributor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <h2>Add contributor</h2>
      <p className="muted">Creates a new row in `community_contributors`.</p>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Avatar URL (optional)
          <input
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://..."
          />
        </label>
        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Add contributor'}
        </button>
      </form>
      {status ? <p className="status ok">{status}</p> : null}
      {error ? <p className="status error">{error}</p> : null}
    </section>
  );
}

function AddDeveloperPanel() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [positionsText, setPositionsText] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setError(null);

    const positions = positionsText
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    try {
      await adminFetch('/api/admin/developers', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          avatar: avatar.trim() || null,
          positions,
        }),
      });
      setStatus(`Added developer “${name.trim()}”`);
      setName('');
      setAvatar('');
      setPositionsText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add developer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <h2>Add developer</h2>
      <p className="muted">Creates a new row in `community_developers`.</p>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Positions (comma-separated)
          <input
            value={positionsText}
            onChange={(e) => setPositionsText(e.target.value)}
            placeholder="Creator, React Native Developer"
            required
          />
        </label>
        <label>
          Avatar URL (optional)
          <input
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://..."
          />
        </label>
        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Add developer'}
        </button>
      </form>
      {status ? <p className="status ok">{status}</p> : null}
      {error ? <p className="status error">{error}</p> : null}
    </section>
  );
}

function ReleaseNotesPanel() {
  const [notes, setNotes] = useState<ReleaseNote[]>([]);
  const [version, setVersion] = useState('');
  const [versionCode, setVersionCode] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [iconsText, setIconsText] = useState('');
  const [featureTitles, setFeatureTitles] = useState<string[]>(['']);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setListError(null);
    try {
      const data = await adminFetch<{ releaseNotes: ReleaseNote[] }>(
        '/api/admin/release-notes?page=1&limit=50',
      );
      setNotes(data.releaseNotes);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to load release notes');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setError(null);

    const features = featureTitles
      .map((title, index) => ({ id: index + 1, title: title.trim() }))
      .filter((f) => f.title.length > 0);

    const icons = iconsText
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    try {
      await adminFetch('/api/admin/release-notes', {
        method: 'POST',
        body: JSON.stringify({
          version: version.trim(),
          versionCode: Number(versionCode),
          releaseDate: releaseDate.trim() || null,
          icons,
          features,
        }),
      });
      setStatus(`Added release ${version.trim()} (${versionCode})`);
      setVersion('');
      setVersionCode('');
      setReleaseDate('');
      setIconsText('');
      setFeatureTitles(['']);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add release note');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <h2>Release notes</h2>
      <p className="muted">Add a new release, then browse recent notes below.</p>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Version
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.2.5"
            required
          />
        </label>
        <label>
          Version code
          <input
            type="number"
            min={1}
            value={versionCode}
            onChange={(e) => setVersionCode(e.target.value)}
            placeholder="35"
            required
          />
        </label>
        <label>
          Release date (optional, YYYY-MM-DD)
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
          />
        </label>
        <label>
          Icons (comma-separated paths)
          <input
            value={iconsText}
            onChange={(e) => setIconsText(e.target.value)}
            placeholder="assets/icons/..."
          />
        </label>

        <div>
          <label>Features</label>
          {featureTitles.map((title, index) => (
            <div className="feature-row" key={`feature-${index}`}>
              <input
                value={title}
                onChange={(e) => {
                  const next = [...featureTitles];
                  next[index] = e.target.value;
                  setFeatureTitles(next);
                }}
                placeholder={`Feature ${index + 1}`}
                required={index === 0}
              />
              {featureTitles.length > 1 ? (
                <button
                  className="ghost"
                  type="button"
                  onClick={() =>
                    setFeatureTitles(featureTitles.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
          <button
            className="ghost"
            type="button"
            onClick={() => setFeatureTitles([...featureTitles, ''])}
          >
            Add feature
          </button>
        </div>

        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Add release note'}
        </button>
      </form>

      {status ? <p className="status ok">{status}</p> : null}
      {error ? <p className="status error">{error}</p> : null}

      <div style={{ marginTop: '1.5rem' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3>Recent releases</h3>
          <button className="ghost" type="button" onClick={() => void load()}>
            Refresh
          </button>
        </div>
        {listError ? <p className="status error">{listError}</p> : null}
        <div className="card-list" style={{ marginTop: '0.75rem' }}>
          {notes.map((note) => (
            <article className="release-item" key={note.versionCode}>
              <h3>
                {note.version}{' '}
                <span className="muted">(code {note.versionCode})</span>
              </h3>
              {note.icons.length > 0 ? (
                <p className="muted">Icons: {note.icons.join(', ')}</p>
              ) : null}
              <ul>
                {note.features.map((feature) => (
                  <li key={feature.id}>{feature.title}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(() => Boolean(getAdminSecret()));
  const [tab, setTab] = useState<Tab>('people');

  if (!unlocked) {
    return <LoginGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h1>MetroConnect Admin</h1>
          <p>Local dashboard</p>
        </div>
        <nav className="nav">
          <button
            type="button"
            className={tab === 'people' ? 'active' : ''}
            onClick={() => setTab('people')}
          >
            People
          </button>
          <button
            type="button"
            className={tab === 'contributor' ? 'active' : ''}
            onClick={() => setTab('contributor')}
          >
            Add contributor
          </button>
          <button
            type="button"
            className={tab === 'developer' ? 'active' : ''}
            onClick={() => setTab('developer')}
          >
            Add developer
          </button>
          <button
            type="button"
            className={tab === 'releases' ? 'active' : ''}
            onClick={() => setTab('releases')}
          >
            Release notes
          </button>
        </nav>
        <div className="sidebar-footer">
          <button
            type="button"
            onClick={() => {
              clearAdminSecret();
              setUnlocked(false);
            }}
          >
            Lock / sign out
          </button>
        </div>
      </aside>

      <main className="main">
        {tab === 'people' ? <PeoplePanel /> : null}
        {tab === 'contributor' ? <AddContributorPanel /> : null}
        {tab === 'developer' ? <AddDeveloperPanel /> : null}
        {tab === 'releases' ? <ReleaseNotesPanel /> : null}
      </main>
    </div>
  );
}
