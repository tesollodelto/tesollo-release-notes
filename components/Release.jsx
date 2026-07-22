// Release content area — version detail with sections, stats, code blocks
const { useState: useStateRel } = React;

const WRENCH_ICON = (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor"
       strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
       style={{ verticalAlign: '-0.125em' }} aria-hidden="true">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const SECTION_META = {
  feature:     { symbol: '+',  cls: 'sec-feature' },
  improvement: { symbol: '↑',  cls: 'sec-improvement' },
  fix:         { symbol: WRENCH_ICON,  cls: 'sec-fix' },
  breaking:    { symbol: '!',  cls: 'sec-breaking' },
  security:    { symbol: '◆',  cls: 'sec-security' },
  doc:         { symbol: '¶',  cls: 'sec-doc' },
};

const TYPE_META = {
  major: { label: 'MAJOR', cls: 'pill-major' },
  minor: { label: 'MINOR', cls: 'pill-minor' },
  patch: { label: 'PATCH', cls: 'pill-patch' },
};

function CopyButton({ text, lang }) {
  const t = window.I18N[lang];
  const [copied, setCopied] = useStateRel(false);
  const handle = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }).catch(() => {});
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch(e) {}
      document.body.removeChild(ta);
    }
  };
  return (
    <button className="copy-btn" onClick={handle} aria-label={t.copyToClipboard}>
      {copied ? t.copied : t.copy}
    </button>
  );
}

function CodeBlock({ lang: codeLang, content, lang }) {
  return (
    <div className="code-block">
      <div className="code-head">
        <span className="code-lang">{codeLang}</span>
        <CopyButton text={content} lang={lang} />
      </div>
      <pre className="code-pre"><code>{content}</code></pre>
    </div>
  );
}

function Stat({ label, value, lang }) {
  const locale = window.I18N[lang].locale;
  return (
    <div className="stat">
      <div className="stat-value">{value.toLocaleString(locale)}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Section({ section, lang }) {
  const meta = SECTION_META[section.kind];
  const t = window.I18N[lang];
  const [collapsed, setCollapsed] = useStateRel(false);
  const sectionTag = t.sectionMeta[section.kind] || section.kind;
  return (
    <section className={`release-section ${meta.cls}`}>
      <header className="section-head" onClick={() => setCollapsed(!collapsed)}>
        <span className="section-symbol" aria-hidden="true">{meta.symbol}</span>
        <h3 className="section-title">{section.title}</h3>
        <span className="section-tag">{sectionTag}</span>
        <span className="section-count">{section.items.length}</span>
        <span className={`section-chev ${collapsed ? 'is-collapsed' : ''}`} aria-hidden="true">▾</span>
      </header>
      {!collapsed && (
        <ul className="section-list">
          {section.items.map((item, idx) => (
            <li key={idx} className="section-item">
              <span className="item-text">{item.text}</span>
              {item.pr && (
                <a
                  className="pr-link"
                  href="#"
                  onClick={e => e.preventDefault()}
                  title={`PR #${item.pr}`}
                >#{item.pr}</a>
              )}
            </li>
          ))}
        </ul>
      )}
      {!collapsed && section.code && <CodeBlock lang={section.code.lang} content={section.code.content} lang={lang} />}
    </section>
  );
}

function ReleaseHeader({ release, repo, onShare, track, lang }) {
  const t = window.I18N[lang];
  const typeMeta = TYPE_META[release.type];
  const dateLong = new Date(release.date).toLocaleDateString(t.locale, {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const trackLabel = t.tracks[track];
  const title = release.title;
  const summary = release.summary;
  return (
    <header className="release-header">
      <div className="release-meta-row">
        <span className={`type-pill ${typeMeta.cls}`}>{typeMeta.label}</span>
        <span className={`track-pill track-${track}`}>{trackLabel}</span>
        <span className="release-date">{dateLong}</span>
        {release.tag && <span className={`release-tag tag-${release.tag === 'Latest' ? 'latest' : 'wip'}`}>{release.tag}</span>}
        <div className="release-meta-spacer"></div>
        <button className="ghost-btn" onClick={onShare} title={t.shareTitle}>
          <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
            <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M6 9l4-2M6 7l4 2"/>
            <circle cx="4" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          {t.share}
        </button>
      </div>
      <div className="release-version">v{release.version} · {trackLabel}</div>
      <h1 className="release-title">{title}</h1>
      <p className="release-summary">{summary}</p>
    </header>
  );
}

function StatsRow({ stats, lang }) {
  if (!stats) return null;
  const t = window.I18N[lang];
  const entries = [
    { key: 'features', label: t.statsFeatures, value: stats.features ?? 0 },
    { key: 'changes', label: t.statsChanges, value: stats.changes ?? 0 },
    { key: 'fixes', label: t.statsFixes, value: stats.fixes ?? 0 },
  ];
  return (
    <div className="stats-row">
      {entries.map(e => (
        <Stat key={e.key} label={e.label} value={e.value} lang={lang} />
      ))}
    </div>
  );
}

function ReleaseFooter({ release, allVersions, onSelect, lang }) {
  const t = window.I18N[lang];
  const sameTrack = allVersions.filter(v => v.track === release.track);
  const idx = sameTrack.findIndex(v => v.version === release.version);
  const newer = idx > 0 ? sameTrack[idx - 1] : null;
  const older = idx < sameTrack.length - 1 ? sameTrack[idx + 1] : null;
  return (
    <nav className="release-footer">
      {newer ? (
        <button className="footer-nav prev" onClick={() => onSelect(newer.version)}>
          <span className="footer-dir">{t.newer}</span>
          <span className="footer-version">v{newer.version}</span>
          <span className="footer-title">{newer.title}</span>
        </button>
      ) : <div className="footer-spacer" />}
      {older ? (
        <button className="footer-nav next" onClick={() => onSelect(older.version)}>
          <span className="footer-dir">{t.older}</span>
          <span className="footer-version">v{older.version}</span>
          <span className="footer-title">{older.title}</span>
        </button>
      ) : <div className="footer-spacer" />}
    </nav>
  );
}

window.SECTION_META = SECTION_META;
window.TYPE_META = TYPE_META;
window.CopyButton = CopyButton;
window.CodeBlock = CodeBlock;
window.Section = Section;
window.ReleaseHeader = ReleaseHeader;
window.StatsRow = StatsRow;
window.ReleaseFooter = ReleaseFooter;
