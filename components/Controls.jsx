// Filter chips + Tweaks panel
function FilterChips({ available, active, onToggle, counts, lang }) {
  const t = window.I18N[lang];
  if (available.length === 0) return null;
  return (
    <div className="filter-chips" role="toolbar" aria-label={t.tweaks.title}>
      <button
        className={`chip ${active.length === 0 ? 'is-active' : ''}`}
        onClick={() => onToggle(null)}
      >
        {t.filterAll}
      </button>
      {available.map(kind => {
        const meta = window.SECTION_META[kind];
        const label = t.sectionMeta[kind] || kind;
        const isActive = active.includes(kind);
        return (
          <button
            key={kind}
            className={`chip ${isActive ? 'is-active' : ''} chip-${kind}`}
            onClick={() => onToggle(kind)}
          >
            <span className="chip-symbol">{meta.symbol}</span>
            <span>{label}</span>
            {counts[kind] != null && <span className="chip-count">{counts[kind]}</span>}
          </button>
        );
      })}
    </div>
  );
}

function TweaksPanel({ open, tweaks, onChange, onClose, lang }) {
  if (!open) return null;
  const t = window.I18N[lang].tweaks;
  return (
    <div className="tweaks-panel" role="dialog" aria-label={t.title}>
      <div className="tweaks-head">
        <span className="tweaks-title">{t.title}</span>
        <button className="tweaks-close" onClick={onClose} aria-label={t.close}>×</button>
      </div>
      <div className="tweaks-body">
        <div className="tweak-group">
          <label className="tweak-label">{t.language}</label>
          <div className="tweak-segmented">
            {[['ko','한국어'],['en','English']].map(([v,l]) => (
              <button
                key={v}
                className={(tweaks.lang || 'ko') === v ? 'is-active' : ''}
                onClick={() => onChange({ lang: v })}
              >{l}</button>
            ))}
          </div>
        </div>

        <div className="tweak-group">
          <label className="tweak-label">{t.theme}</label>
          <div className="tweak-segmented">
            {[['light', t.light],['dark', t.dark]].map(([v,l]) => (
              <button
                key={v}
                className={tweaks.theme === v ? 'is-active' : ''}
                onClick={() => onChange({ theme: v })}
              >{l}</button>
            ))}
          </div>
        </div>

        <div className="tweak-group">
          <label className="tweak-label">{t.accent}</label>
          <div className="tweak-swatches">
            {[
              { key: 'tesollo', val: 'oklch(0.62 0.15 155)' },
              { key: 'indigo',  val: 'oklch(0.55 0.16 265)' },
              { key: 'amber',   val: 'oklch(0.68 0.15 70)' },
              { key: 'rose',    val: 'oklch(0.6 0.16 20)' },
              { key: 'slate',   val: 'oklch(0.45 0.03 250)' },
            ].map(s => (
              <button
                key={s.key}
                className={`swatch ${tweaks.accent === s.key ? 'is-active' : ''}`}
                style={{ background: s.val }}
                onClick={() => onChange({ accent: s.key })}
                aria-label={s.key}
              />
            ))}
          </div>
        </div>

        <div className="tweak-group">
          <label className="tweak-label">{t.density}</label>
          <div className="tweak-segmented">
            {[['comfortable', t.comfortable],['compact', t.compact]].map(([v,l]) => (
              <button
                key={v}
                className={tweaks.density === v ? 'is-active' : ''}
                onClick={() => onChange({ density: v })}
              >{l}</button>
            ))}
          </div>
        </div>

        <div className="tweak-group">
          <label className="tweak-label">{t.font}</label>
          <div className="tweak-segmented">
            {[['pretendard','Pretendard'],['inter','Inter'],['ibmPlex','IBM Plex']].map(([v,l]) => (
              <button
                key={v}
                className={tweaks.font === v ? 'is-active' : ''}
                onClick={() => onChange({ font: v })}
              >{l}</button>
            ))}
          </div>
        </div>

        <div className="tweak-group">
          <label className="tweak-label">{t.sidebar}</label>
          <div className="tweak-segmented">
            {[['shown', t.shown],['hidden', t.hidden]].map(([v,l]) => (
              <button
                key={v}
                className={tweaks.sidebar === v ? 'is-active' : ''}
                onClick={() => onChange({ sidebar: v })}
              >{l}</button>
            ))}
          </div>
        </div>

        <div className="tweak-group">
          <label className="tweak-label">{t.layout}</label>
          <div className="tweak-segmented">
            {[['focus', t.focus],['wide', t.wide]].map(([v,l]) => (
              <button
                key={v}
                className={tweaks.layout === v ? 'is-active' : ''}
                onClick={() => onChange({ layout: v })}
              >{l}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.FilterChips = FilterChips;
window.TweaksPanel = TweaksPanel;
