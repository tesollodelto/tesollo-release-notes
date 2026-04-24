// Top nav with brand, track tabs, search, language toggle
const { useState, useMemo } = React;

function TopNav({ versions, currentTrack, onTrackChange, search, onSearch, repo, lang, onLangChange }) {
  const t = window.I18N[lang];
  const trackCounts = useMemo(() => ({
    software: versions.filter(v => v.track === 'software').length,
    sdk: versions.filter(v => v.track === 'sdk').length,
    firmware: versions.filter(v => v.track === 'firmware').length,
  }), [versions]);

  const trackList = [
    { key: 'software', label: t.tracks.software },
    { key: 'sdk', label: t.tracks.sdk },
    { key: 'firmware', label: t.tracks.firmware },
  ];

  return (
    <header className="topnav">
      <a href="#" className="nav-brand" onClick={(e) => e.preventDefault()}>
        <img
          className="brand-logo"
          src="https://en.tesollo.com/wp-content/uploads/2025/06/Artboard-1@2x.png"
          alt="TESOLLO"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline'; }}
        />
        <span className="brand-name" style={{display:'none'}}>TESOLLO</span>
        <span className="brand-divider" aria-hidden="true"></span>
        <span className="brand-sub">{t.brandSub}</span>
      </a>

      <div className="nav-spacer"></div>

      <nav className="track-tabs" role="tablist">
        {trackList.map(track => (
          <button
            key={track.key}
            role="tab"
            aria-selected={currentTrack === track.key}
            className={`track-tab ${currentTrack === track.key ? 'is-active' : ''}`}
            onClick={() => onTrackChange(track.key)}
          >
            <span>{track.label}</span>
            <span className="track-count">{trackCounts[track.key]}</span>
          </button>
        ))}
      </nav>

      <div className="nav-actions">
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={e => onSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => onSearch('')} aria-label={t.clearSearch}>×</button>
          )}
        </div>

        <div className="lang-toggle" role="group" aria-label={t.tweaks.language}>
          <button
            className={lang === 'ko' ? 'is-active' : ''}
            onClick={() => onLangChange('ko')}
            aria-pressed={lang === 'ko'}
          >KO</button>
          <button
            className={lang === 'en' ? 'is-active' : ''}
            onClick={() => onLangChange('en')}
            aria-pressed={lang === 'en'}
          >EN</button>
        </div>

        <a className="repo-link" href="#" onClick={e => e.preventDefault()}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.05-.49.05-.49.81.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82a7.6 7.6 0 014 0c1.53-1.03 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          <span>{repo}</span>
        </a>
      </div>
    </header>
  );
}

function VersionList({ versions, currentVersion, currentTrack, onSelect, search, density, lang }) {
  const t = window.I18N[lang];
  const filtered = useMemo(() => {
    const inTrack = versions.filter(v => v.track === currentTrack);
    if (!search.trim()) return inTrack;
    const q = search.toLowerCase();
    return inTrack.filter(v =>
      v.version.includes(q) ||
      (v.title || '').toLowerCase().includes(q) ||
      (v.summary || '').toLowerCase().includes(q) ||
      v.sections.some(s => s.items.some(i => (i.text || '').toLowerCase().includes(q)))
    );
  }, [versions, search, currentTrack]);

  const grouped = useMemo(() => {
    const groups = [];
    let currentMajor = null;
    filtered.forEach(v => {
      const major = v.version.split('.')[0];
      if (major !== currentMajor) {
        currentMajor = major;
        groups.push({ key: major, label: `v${major}.x`, items: [] });
      }
      groups[groups.length - 1].items.push(v);
    });
    return groups;
  }, [filtered]);

  return (
    <aside className="version-list-wrap" data-density={density}>
      <h3 className="list-heading">{t.allVersions}</h3>
      {grouped.length === 0 && (
        <div className="empty-state">{t.noMatches}</div>
      )}
      {grouped.map(group => (
        <div className="nav-group" key={group.key}>
          <div className="nav-group-label">{group.label}</div>
          <ul className="nav-list">
            {group.items.map(v => (
              <li key={v.track + v.version}>
                <button
                  className={`nav-item ${v.version === currentVersion && v.track === currentTrack ? 'is-active' : ''}`}
                  onClick={() => onSelect(v.version)}
                >
                  <span className={`nav-dot type-${v.type}`} aria-hidden="true"></span>
                  <span className="nav-version">v{v.version}</span>
                  <span className="nav-date">{formatShortDate(v.date, lang)}</span>
                  {v.tag && <span className={`nav-tag tag-${v.tag === 'Latest' ? 'latest' : 'wip'}`}>{v.tag}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}

function formatShortDate(iso, lang) {
  const d = new Date(iso);
  const locale = (window.I18N?.[lang]?.locale) || 'ko-KR';
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

window.TopNav = TopNav;
window.VersionList = VersionList;
window.formatShortDate = formatShortDate;
