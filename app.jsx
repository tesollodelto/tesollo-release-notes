// Main App component — loads release JSON by current language
const { useState: useStateApp, useEffect: useEffectApp, useMemo: useMemoApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "tesollo",
  "density": "comfortable",
  "font": "pretendard",
  "sidebar": "shown",
  "layout": "focus",
  "lang": "ko"
}/*EDITMODE-END*/;

function Root() {
  const [tweaks, setTweaks] = useStateApp(TWEAK_DEFAULTS);
  const [tweaksOpen, setTweaksOpen] = useStateApp(false);
  const [editMode, setEditMode] = useStateApp(false);
  const [data, setData] = useStateApp(null);
  const [loadError, setLoadError] = useStateApp(null);

  const lang = tweaks.lang || 'ko';
  const t = window.I18N[lang];

  useEffectApp(() => {
    let cancelled = false;
    window.loadReleases(lang)
      .then(d => { if (!cancelled) setData(d); })
      .catch(err => { if (!cancelled) setLoadError(err.message); });
    return () => { cancelled = true; };
  }, [lang]);

  useEffectApp(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
    document.documentElement.setAttribute('data-accent', tweaks.accent);
    document.documentElement.setAttribute('data-font', tweaks.font);
    document.documentElement.setAttribute('lang', lang);
  }, [tweaks, lang]);

  useEffectApp(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setEditMode(true);
      if (e.data?.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffectApp(() => {
    setTweaksOpen(editMode);
  }, [editMode]);

  const handleTweakChange = (patch) => {
    setTweaks(prev => {
      const next = { ...prev, ...patch };
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
      return next;
    });
  };

  if (loadError) {
    return <div style={{padding: 40, color: 'crimson'}}>Failed to load release data: {loadError}</div>;
  }
  if (!data) {
    return <div className="boot-splash">{lang === 'en' ? 'Loading release notes…' : '릴리즈 노트를 불러오는 중…'}</div>;
  }

  return (
    <App
      data={data}
      lang={lang}
      tweaks={tweaks}
      tweaksOpen={tweaksOpen}
      onTweakChange={handleTweakChange}
      onTweaksClose={() => setTweaksOpen(false)}
    />
  );
}

function App({ data, lang, tweaks, tweaksOpen, onTweakChange, onTweaksClose }) {
  const versions = data.versions;
  const t = window.I18N[lang];

  const [currentTrack, setCurrentTrack] = useStateApp(() => {
    return localStorage.getItem('dgm.track') || 'software';
  });
  const [currentVersion, setCurrentVersion] = useStateApp(() => {
    const saved = localStorage.getItem('dgm.version');
    if (saved) return saved;
    const track = localStorage.getItem('dgm.track') || 'software';
    const first = versions.find(v => v.track === track);
    return first?.version;
  });

  const [search, setSearch] = useStateApp('');
  const [activeFilters, setActiveFilters] = useStateApp([]);
  const [shareToast, setShareToast] = useStateApp(false);

  useEffectApp(() => { localStorage.setItem('dgm.track', currentTrack); }, [currentTrack]);
  useEffectApp(() => { if (currentVersion) localStorage.setItem('dgm.version', currentVersion); }, [currentVersion]);

  const handleTrackChange = (track) => {
    setCurrentTrack(track);
    const first = versions.find(v => v.track === track);
    if (first) setCurrentVersion(first.version);
    setActiveFilters([]);
  };

  const release = useMemoApp(() => {
    return versions.find(v => v.version === currentVersion && v.track === currentTrack)
      || versions.find(v => v.track === currentTrack);
  }, [versions, currentVersion, currentTrack]);

  const availableSectionKinds = useMemoApp(() => {
    if (!release) return [];
    const seen = new Set();
    release.sections.forEach(s => seen.add(s.kind));
    return [...seen];
  }, [release]);

  const sectionCounts = useMemoApp(() => {
    if (!release) return {};
    const c = {};
    release.sections.forEach(s => {
      c[s.kind] = (c[s.kind] || 0) + s.items.length;
    });
    return c;
  }, [release]);

  const filteredSections = useMemoApp(() => {
    if (!release) return [];
    if (activeFilters.length === 0) return release.sections;
    return release.sections.filter(s => activeFilters.includes(s.kind));
  }, [release, activeFilters]);

  const handleFilter = (kind) => {
    if (kind === null) { setActiveFilters([]); return; }
    setActiveFilters(prev =>
      prev.includes(kind) ? prev.filter(k => k !== kind) : [...prev, kind]
    );
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#${currentTrack}/v${release.version}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 1800);
      }).catch(() => {});
    }
  };

  useEffectApp(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentVersion, currentTrack]);

  if (!release) {
    return <div style={{padding: 40}}>{t.releaseNotFound}</div>;
  }

  return (
    <div className="app" data-sidebar={tweaks.sidebar} data-layout={tweaks.layout} data-density={tweaks.density}>
      <TopNav
        versions={versions}
        currentTrack={currentTrack}
        onTrackChange={handleTrackChange}
        search={search}
        onSearch={setSearch}
        repo={data.product.repo}
        lang={lang}
        onLangChange={(l) => onTweakChange({ lang: l })}
      />

      <div className="main-wrap">
        <VersionList
          versions={versions}
          currentVersion={currentVersion}
          currentTrack={currentTrack}
          onSelect={setCurrentVersion}
          search={search}
          density={tweaks.density}
          lang={lang}
        />

        <article className="article">
          <ReleaseHeader
            release={release}
            repo={data.product.repo}
            onShare={handleShare}
            track={currentTrack}
            lang={lang}
          />

          {(release.stats?.features != null || release.stats?.changes != null || release.stats?.fixes != null) && (
            <StatsRow stats={release.stats} lang={lang} />
          )}

          {release.sections.length > 0 && (
            <FilterChips
              available={availableSectionKinds}
              active={activeFilters}
              onToggle={handleFilter}
              counts={sectionCounts}
              lang={lang}
            />
          )}

          {filteredSections.map((section) => {
            const origIdx = release.sections.indexOf(section);
            return <Section key={origIdx} section={section} lang={lang} />;
          })}

          {release.sections.length === 0 && (
            <div className="empty-release">
              <p>{t.emptyRelease}</p>
            </div>
          )}

          <ReleaseFooter
            release={release}
            allVersions={versions}
            onSelect={setCurrentVersion}
            lang={lang}
          />
        </article>
      </div>

      <TweaksPanel
        open={tweaksOpen}
        tweaks={tweaks}
        onChange={onTweakChange}
        onClose={onTweaksClose}
        lang={lang}
      />

      {shareToast && (
        <div className="share-toast">{t.shareToast}</div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
