// Release-data loader with per-product folder + lang JSON files.
// Source of truth: data/release_notes/{DGManager,DGSDK,Firmware}/{ko,en}.json
// Edit those files directly to add or update release notes.
//
// Usage:
//   const data = await window.loadReleases('ko');
//   // data = { product: {...}, tracks: [...],
//   //          versions: [ ...merged from all 3 tracks, newest first per track ] }

window.RELEASE_DATA = null;
window.RELEASE_LANG = null;
window._releaseCache = {};

const TRACKS = ['software', 'sdk', 'firmware'];
const TRACK_DIRS = {
  software: 'DGManager',
  sdk:      'DGSDK',
  firmware: 'Firmware',
};

window.loadReleases = async function(lang) {
  if (window._releaseCache[lang]) {
    window.RELEASE_DATA = window._releaseCache[lang];
    window.RELEASE_LANG = lang;
    return window.RELEASE_DATA;
  }
  const results = await Promise.all(
    TRACKS.map(async (track) => {
      const url = `data/release_notes/${TRACK_DIRS[track]}/${lang}.json`;
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
      return res.json();
    })
  );
  // Merge
  const merged = {
    product: {
      name: 'Tesollo Software',
      repo: results[0].product.repo,
      tracks: TRACKS.map((t, i) => ({
        key: t,
        name: results[i].product.name,
        description: results[i].product.description,
      })),
    },
    tracks: TRACKS,
    // JSON files store versions oldest-first (so new releases are appended
    // at the end). Reverse per-track so the UI sees newest-first.
    versions: results.flatMap(r => [...r.versions].reverse()),
  };
  window._releaseCache[lang] = merged;
  window.RELEASE_DATA = merged;
  window.RELEASE_LANG = lang;
  return merged;
};
