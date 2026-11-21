// Leonida Trophy Guide: a checklist and tracker for the 55 GTA VI trophies.
// Progress is saved in localStorage; the list, guides and roadmap come from
// data/trophies.json and data/roadmap.json, fetched from this app's own files.
const STORE_KEY = 'leonida-trophy-guide-v1';
const KIND_LABELS = {
  all: 'All kinds', story: 'Story', missable: 'Missable', collectibles: 'Collectibles',
  activities: 'Activities', side: 'Side missions', crime: 'Crime', money: 'Money',
  odd: 'Odd ones', completion: '100% & platinum', platinum: 'Platinum', online: 'Online',
};
const KIND_ORDER = ['all', 'story', 'missable', 'collectibles', 'activities', 'side', 'crime', 'money', 'odd', 'completion', 'online'];

const listEl = document.getElementById('trophyList');
const emptyEl = document.getElementById('emptyNote');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const hideEarnedEl = document.getElementById('hideEarned');
const kindRowEl = document.getElementById('kindRow');
const shownEl = document.getElementById('shownCount');

let trophies = [];
let roadmap = null;
let earned = new Set(loadStored());
let activeKind = 'all';
let openId = null;

function loadStored() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]'); } catch { return []; }
}
function saveStored() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}
function trophyById(id) { return trophies.find((t) => t.id === id); }
function isStory(t) { return t.kinds.includes('story'); }

function readHashState() {
  const params = new URLSearchParams(location.hash.slice(1));
  if (params.get('kind') && KIND_LABELS[params.get('kind')]) activeKind = params.get('kind');
  if (params.get('grade')) gradeEl.value = params.get('grade');
  if (params.get('spoiler') === 'on') spoilerEl.checked = true;
  if (params.get('open')) openId = Number(params.get('open'));
  if (params.has('clear')) {
    // Wipe stored progress (used for a clean screenshot state).
    earned = new Set();
    localStorage.removeItem(STORE_KEY);
  }
  if (params.has('demo')) {
    // Demo progress for screenshots only: the twelve story trophies.
    for (let id = 2; id <= 13; id += 1) earned.add(id);
    saveStored();
  }
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  document.getElementById('progressCount').textContent = `${done} of ${total} earned`;
  document.getElementById('progressFill').style.width = total ? `${(done / total) * 100}%` : '0%';
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] || [0, 0];
    byGrade[t.grade][1] += 1;
    if (earned.has(t.id)) byGrade[t.grade][0] += 1;
  }
  document.getElementById('progressGrades').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${byGrade[g][0]}/${byGrade[g][1]} ${g}`)
    .join(' · ');
}

function renderRoadmap() {
  const stagesEl = document.getElementById('stages');
  stagesEl.replaceChildren();
  for (const stage of roadmap.stages) {
    const ids = trophies.filter((t) => t.stage === stage.id).map((t) => t.id);
    const done = ids.filter((id) => earned.has(id)).length;
    const card = document.createElement('article');
    card.className = 'stage';
    const title = document.createElement('h3');
    title.textContent = stage.title;
    const hours = document.createElement('p');
    hours.className = 'hours';
    hours.textContent = stage.hours;
    const text = document.createElement('p');
    text.textContent = stage.text;
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = `${done} of ${ids.length} trophies in this stage`;
    card.append(title, hours, text, count);
    stagesEl.append(card);
  }
  const warningsEl = document.getElementById('warnings');
  warningsEl.replaceChildren();
  for (const w of roadmap.warnings) {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = `${w.title}: `;
    li.append(strong, document.createTextNode(w.text));
    warningsEl.append(li);
  }
}

function renderKindChips() {
  kindRowEl.replaceChildren();
  for (const kind of KIND_ORDER) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = KIND_LABELS[kind];
    chip.setAttribute('aria-pressed', String(activeKind === kind));
    chip.addEventListener('click', () => { activeKind = kind; renderKindChips(); renderList(); });
    kindRowEl.append(chip);
  }
}

function trophyMatches(t) {
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (activeKind === 'online') return false;
  if (activeKind !== 'all' && !t.kinds.includes(activeKind)) return false;
  if (hideEarnedEl.checked && earned.has(t.id)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function spoilerHidden(t) {
  return spoilerEl.checked && isStory(t) && !earned.has(t.id);
}

function guideDetails(t) {
  const box = document.createElement('div');
  box.className = 'guide';
  box.hidden = openId !== t.id;
  const guidePara = document.createElement('p');
  guidePara.textContent = t.guide;
  box.append(guidePara);
  if (t.unconfirmed) {
    const note = document.createElement('p');
    note.textContent = 'Unconfirmed: no published guide has verified the exact method yet. This entry gives the official description and what the guides report, and nothing more.';
    box.append(note);
  }
  const src = document.createElement('p');
  src.className = 'sources';
  const label = document.createElement('strong');
  label.textContent = 'Sources: ';
  src.append(label);
  t.sources.forEach((s, i) => {
    if (i > 0) src.append(document.createTextNode(' · '));
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    src.append(a);
  });
  box.append(src);
  return box;
}

function trophyCard(t) {
  const li = document.createElement('li');
  li.className = `trophy${earned.has(t.id) ? ' earned' : ''}`;
  li.dataset.trophyId = String(t.id);
  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    saveStored();
    renderProgress();
    renderRoadmap();
    renderList();
  });
  const titleBox = document.createElement('div');
  titleBox.className = 'trophy-title';
  const title = document.createElement('h3');
  const num = document.createElement('span');
  num.className = 'trophy-id';
  num.textContent = `#${t.id}`;
  title.append(num);
  if (spoilerHidden(t)) {
    const mask = document.createElement('span');
    mask.className = 'spoiler-mask';
    mask.textContent = 'Story trophy — hidden until earned';
    title.append(mask);
  } else {
    title.append(document.createTextNode(t.name));
  }
  const official = document.createElement('p');
  official.className = 'official';
  if (spoilerHidden(t)) {
    official.textContent = 'Spoiler-safe mode is on. Tick the box once you have earned it to reveal its name and description.';
  } else {
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = 'Official: ';
    official.append(label, document.createTextNode(t.description));
  }
  titleBox.append(title, official);
  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${t.grade}`;
  badge.textContent = t.grade;
  head.append(box, titleBox, badge);
  li.append(head);

  const tags = document.createElement('div');
  tags.className = 'tags';
  for (const kind of t.kinds) {
    if (kind === 'missable') continue; // the ⚠ Missable badge below covers it.
    const tag = document.createElement('span');
    tag.className = `tag${kind === 'story' ? ' tag-story' : ''}`;
    tag.textContent = KIND_LABELS[kind] ?? kind;
    tags.append(tag);
  }
  if (t.missable) {
    const tag = document.createElement('span');
    tag.className = 'tag tag-missable';
    tag.textContent = '⚠ Missable';
    tags.append(tag);
  }
  if (t.unconfirmed) {
    const tag = document.createElement('span');
    tag.className = 'tag tag-unconfirmed';
    tag.textContent = 'Method unconfirmed';
    tags.append(tag);
  }
  if (t.hidden) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = 'Hidden on PS5';
    tags.append(tag);
  }
  li.append(tags);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  if (spoilerHidden(t)) {
    // A masked story trophy keeps its guide hidden too.
    toggle.disabled = true;
    toggle.textContent = 'Guide hidden until earned';
  } else {
    toggle.textContent = openId === t.id ? 'Hide guide' : 'Show guide & sources';
  }
  const details = guideDetails(t);
  toggle.addEventListener('click', () => {
    openId = openId === t.id ? null : t.id;
    details.hidden = openId !== t.id;
    toggle.textContent = openId === t.id ? 'Hide guide' : 'Show guide & sources';
  });
  li.append(toggle, details);
  return li;
}

function renderList() {
  const shown = trophies.filter(trophyMatches);
  listEl.replaceChildren();
  for (const t of shown) listEl.append(trophyCard(t));
  emptyEl.hidden = shown.length > 0;
  if (shown.length === 0 && activeKind === 'online') {
    emptyEl.textContent = 'There are no online trophies in GTA VI — all 55 are offline single-player.';
    emptyEl.hidden = false;
  } else if (shown.length === 0) {
    emptyEl.textContent = 'No trophies match these filters. Try clearing the search or choosing another kind.';
  }
  shownEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies`;
}

function renderSources() {
  const seen = new Map();
  for (const t of trophies) {
    for (const s of t.sources) seen.set(s.url, s.name);
  }
  const ul = document.getElementById('sourceList');
  ul.replaceChildren();
  for (const [url, name] of seen) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = name;
    li.append(a);
    ul.append(li);
  }
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = ids.filter((id) => Number.isInteger(id) && trophyById(id));
    earned = new Set(valid);
    saveStored();
    renderProgress();
    renderRoadmap();
    renderList();
  } catch {
    alert('That file is not a progress export from this guide.');
  }
}

async function loadData() {
  const [trophyDoc, roadmapDoc] = await Promise.all([
    (await fetch('data/trophies.json')).json(),
    (await fetch('data/roadmap.json')).json(),
  ]);
  trophies = trophyDoc.trophies;
  roadmap = roadmapDoc;
}

document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) importProgress(file);
  e.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveStored();
    renderProgress();
    renderRoadmap();
    renderList();
  }
});
searchEl.addEventListener('input', renderList);
gradeEl.addEventListener('change', renderList);
spoilerEl.addEventListener('change', renderList);
hideEarnedEl.addEventListener('change', renderList);

readHashState();
await loadData();
renderProgress();
renderRoadmap();
renderKindChips();
renderSources();
renderList();
