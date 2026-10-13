// SOP process-tree engine: data indexing + layout math. No rendering, no styling.

// Origin classes. These are NOT inferred from the documents — the catalogue
// records no intake channel anywhere (0 of 64 documents state one). They come
// from the curated symptom and operations indexes in guided-path.js, so a count
// here means "this many SOPs are reachable from this origin", nothing more.
// Responsibility areas, supplied by the caller from the curated index.
// Intake channel is deliberately absent: no document records one, and it does
// not change whether the work is ours or what the procedure says.
export const CHANNELS = [
  { id: 'identity',   label: 'Identity & access',     short: 'IDENTITY & ACCESS' },
  { id: 'collab',     label: 'Collaboration',         short: 'COLLABORATION' },
  { id: 'estate',     label: 'Devices & estate',      short: 'DEVICES & ESTATE' },
  { id: 'security',   label: 'Security & compliance', short: 'SECURITY & COMPLIANCE' },
  { id: 'governance', label: 'Governance & change',   short: 'GOVERNANCE & CHANGE' },
  { id: 'notours',    label: 'Not ours — redirect',   short: 'NOT OURS' }
];

export const DOMAINS = [
  { key: 'A. Microsoft 365',           code: 'M365', label: 'Microsoft 365' },
  { key: 'B. Account Usage',           code: 'ACC',  label: 'Account Usage' },
  { key: 'C. Device Usage',            code: 'DEV',  label: 'Device Usage' },
  { key: 'D. Cross-Cutting Governance', code: 'GOV', label: 'Governance' }
];

export const NODE_TYPES = {
  start:      { label: 'Start / trigger' },
  process:    { label: 'Process step' },
  decision:   { label: 'Decision gate' },
  subprocess: { label: 'Sub-process \u2192 SOP' },
  record:     { label: 'Record / evidence' },
  wait:       { label: 'Wait / SLA' },
  risk:       { label: 'Stop / escalate' },
  end:        { label: 'Exit criteria met' }
};

export async function load(url, originsFor) {
  const graph = await (await fetch(url)).json();
  return index(graph, originsFor);
}

export function index(graph, originsFor) {
  const byId = {};
  graph.forEach(d => {
    byId[d.id] = d;
    d.code = d.id.split('-')[0];
    d.domainCode = (DOMAINS.find(x => x.key === d.domain) || {}).code || d.code;
    d.blob = [d.title, d.subtitle, d.audience, d.tierText,
      ...d.flows.flatMap(f => f.steps.map(s => s.text))].join(' ');
    d.channels = originsFor ? (originsFor(d) || []) : [];
    d.stepCount = d.flows.reduce((a, f) => a + f.steps.length, 0);
  });
  const links = [];
  graph.forEach(d => d.refs.forEach(r => { if (byId[r]) links.push({ from: d.id, to: r }); }));
  return { docs: graph, byId, links,
    counts: { docs: graph.length,
      flows: graph.reduce((a, d) => a + d.flows.length, 0),
      steps: graph.reduce((a, d) => a + d.stepCount, 0),
      links: links.length } };
}

/* ---------- flow layout: layered top-down spine with side branches ---------- */

const NW = 236, GAPY = 34, BRANCH_DX = 300;

function nodeH(label, wide) {
  const chars = (label || '').length;
  const per = wide ? 30 : 24;
  return Math.max(52, 26 + Math.ceil(chars / per) * 19);
}

export function layoutFlow(doc, flow, startY = 0) {
  const nodes = [], edges = [], bands = [];
  const X = 0;
  let y = startY, band = null, maxX = NW;

  const push = (n) => { nodes.push(n); return n; };

  const startNode = push({ key: flow.num + '-start', type: 'start', sec: '', x: X, y, w: NW,
    h: 48, label: flow.name, doc: doc.id, role: doc.tier ? 'Tier ' + doc.tier : 'IT' });
  y += 48 + GAPY;
  let prev = startNode;

  flow.steps.forEach((s, i) => {
    if (s.sub && (!band || band.name !== s.sub)) {
      band = { name: s.sub, y0: y - 14, y1: 0 };
      bands.push(band);
    }
    const h = nodeH(s.label, s.type === 'decision');
    const n = push({ key: s.sec, type: s.type, sec: s.sec, x: X, y, w: NW, h,
      label: s.label, step: s, doc: doc.id, role: s.role, warn: s.warn, refs: s.refs });
    edges.push({ from: prev.key, to: n.key, kind: prev.type === 'decision' ? 'no' : 'seq',
      label: prev.type === 'decision' ? 'No' : '',
      path: elbow(prev.x + NW / 2, prev.y + prev.h, n.x + NW / 2, n.y) });

    if (s.gate) {
      const bh = nodeH(s.gate.then, false);
      const b = push({ key: s.sec + 'y', type: s.refs.length ? 'subprocess' : 'branch',
        sec: s.sec + ' \u00b7 yes', x: X + BRANCH_DX, y: y + 6, w: NW - 24, h: bh,
        label: s.gate.then, step: s, doc: doc.id, role: s.role, refs: s.refs, branch: true });
      edges.push({ from: n.key, to: b.key, kind: 'yes', label: 'Yes',
        path: elbow(n.x + NW, n.y + h / 2, b.x, b.y + bh / 2, true) });
      maxX = Math.max(maxX, X + BRANCH_DX + NW - 24);
    }
    y += h + GAPY;
    if (band) band.y1 = y - GAPY + 10;
    prev = n;
  });

  const endNode = push({ key: flow.num + '-end', type: 'end', sec: '', x: X, y, w: NW, h: 46,
    label: 'Exit criteria met', doc: doc.id, role: doc.tier ? 'Tier ' + doc.tier : 'IT' });
  edges.push({ from: prev.key, to: endNode.key, kind: 'seq', label: '',
    path: elbow(prev.x + NW / 2, prev.y + prev.h, endNode.x + NW / 2, endNode.y) });
  y += 46;

  return { nodes, edges, bands, w: maxX, h: y - startY, num: flow.num, name: flow.name, flow };
}

export function layoutDoc(doc) {
  const cols = [];
  let x = 0, h = 0;
  doc.flows.forEach(f => {
    const L = layoutFlow(doc, f, 0);
    L.nodes.forEach(n => { n.x += x; });
    L.edges.length = 0;
    // re-route after shift
    rebuild(L);
    L.bands.forEach(b => { b.x = x; b.w = L.w; });
    cols.push(L);
    x += L.w + 96;
    h = Math.max(h, L.h);
  });
  return { cols, w: Math.max(x - 96, 1), h };
}

function rebuild(L) {
  const by = {}; L.nodes.forEach(n => by[n.key] = n);
  const order = L.nodes;
  for (let i = 0; i < order.length; i++) {
    const n = order[i];
    if (n.branch) {
      const p = by[n.key.slice(0, -1)];
      if (p) L.edges.push({ from: p.key, to: n.key, kind: 'yes', label: 'Yes',
        path: elbow(p.x + p.w, p.y + p.h / 2, n.x, n.y + n.h / 2, true) });
      continue;
    }
    const nxt = order.slice(i + 1).find(m => !m.branch);
    if (!nxt) continue;
    L.edges.push({ from: n.key, to: nxt.key, kind: n.type === 'decision' ? 'no' : 'seq',
      label: n.type === 'decision' ? 'No' : '',
      path: elbow(n.x + n.w / 2, n.y + n.h, nxt.x + nxt.w / 2, nxt.y) });
  }
}

function elbow(x1, y1, x2, y2, horizontal) {
  if (horizontal) {
    const mx = (x1 + x2) / 2;
    return `M${x1} ${y1} H${mx} V${y2} H${x2}`;
  }
  if (Math.abs(x1 - x2) < 1) return `M${x1} ${y1} V${y2}`;
  const my = (y1 + y2) / 2;
  return `M${x1} ${y1} V${my} H${x2} V${y2}`;
}

/* ---------- map layouts ---------- */

const CARD_W = 210, CARD_H = 86;

export function layoutMap(g, mode) {
  return mode === 'orbit' ? orbit(g) : mode === 'strata' ? strata(g) : ledger(g);
}

function orbit(g) {
  const R0 = 620, RING = 250;
  const hub = { x: 0, y: 0, w: 236, h: 236, r: 118, round: true };
  const channels = CHANNELS.map((c, i) => {
    const a = (i / CHANNELS.length) * Math.PI * 2 - Math.PI / 2;
    return { ...c, a, x: Math.cos(a) * 300, y: Math.sin(a) * 300 };
  });
  const items = [];
  const regions = [];
  DOMAINS.forEach((dom, di) => {
    const list = g.docs.filter(d => d.domainCode === dom.code)
      .sort((a, b) => b.stepCount - a.stepCount);
    const a0 = (di / 4) * Math.PI * 2 - Math.PI / 2 - 0.66;
    const span = (Math.PI * 2) / 4 * 0.9;
    const perRing = 7;
    const ac = a0 + span / 2;
    const rOut = R0 + Math.ceil(list.length / perRing) * RING;
    regions.push({ ...dom, count: list.length,
      x: Math.cos(ac) * (rOut + 120), y: Math.sin(ac) * (rOut + 120), deg: 0 });
    list.forEach((d, i) => {
      const ring = Math.floor(i / perRing), k = i % perRing;
      const cnt = Math.min(perRing, list.length - ring * perRing);
      const a = a0 + span * (cnt === 1 ? 0.5 : k / (cnt - 1));
      const r = R0 + ring * RING + (k % 2) * 60;
      items.push({ doc: d, dom, x: Math.cos(a) * r - CARD_W / 2, y: Math.sin(a) * r - CARD_H / 2,
        w: CARD_W, h: CARD_H, a, r });
    });
  });
  const out = finish(g, items, channels, hub, 'orbit', regions);
  out.regions = regions;
  return out;
}

function ledger(g) {
  const COLW = 280, GAP = 26;
  const channels = CHANNELS.map((c, i) => ({ ...c, x: -470, y: i * 96, w: 320, h: 70 }));
  const items = [];
  DOMAINS.forEach((dom, di) => {
    const list = g.docs.filter(d => d.domainCode === dom.code).sort((a, b) => a.id.localeCompare(b.id));
    list.forEach((d, i) => {
      items.push({ doc: d, dom, x: di * (COLW + 78), y: i * (CARD_H + GAP) + 74,
        w: COLW, h: CARD_H });
    });
  });
  const hub = { x: -470, y: -170, w: 320, h: 110 };
  const out = ledgerFinish(g, items, channels, hub);
  out.regions = DOMAINS.map((dom, di) => ({ ...dom,
    count: g.docs.filter(d => d.domainCode === dom.code).length,
    x: di * (COLW + 78) + COLW / 2, y: -20, deg: 0 }));
  return out;
}

function ledgerFinish(g, items, channels, hub) {
  return finish(g, items, channels, hub, 'ledger');
}

function strata(g) {
  const bandH = 330;
  const channels = CHANNELS.map((c, i) => ({ ...c, x: i * 250, y: -190, w: 226, h: 76 }));
  const items = [];
  [1, 2, 3, 4].forEach((t, bi) => {
    const list = g.docs.filter(d => (d.tier || 4) === t).sort((a, b) => a.id.localeCompare(b.id));
    const perRow = Math.max(8, Math.ceil(list.length / 2));
    list.forEach((d, i) => {
      items.push({ doc: d, dom: DOMAINS.find(x => x.code === d.domainCode) || DOMAINS[3],
        x: (i % perRow) * (CARD_W + 30), y: bi * bandH + Math.floor(i / perRow) * (CARD_H + 22) + 40,
        w: CARD_W, h: CARD_H, tier: t });
    });
  });
  const bands = [1, 2, 3, 4].map((t, bi) => {
    const rows = items.filter(i => i.tier === t);
    const x0 = rows.length ? Math.min(...rows.map(r => r.x)) - 30 : 0;
    const x1 = rows.length ? Math.max(...rows.map(r => r.x + r.w)) + 30 : 100;
    return { tier: t, y: bi * bandH, h: bandH - 24, x: x0, w: x1 - x0, count: rows.length };
  });
  const out = finish(g, items, channels, { x: 0, y: -340, w: 340, h: 90 }, 'strata');
  out.bands = bands;
  out.regions = [];
  return out;
}

function finish(g, items, channels, hub, mode, extra) {
  const pos = {}; items.forEach(it => pos[it.doc.id] = it);
  const links = [];
  g.links.forEach(l => {
    const a = pos[l.from], b = pos[l.to];
    if (!a || !b) return;
    const ax = a.x + a.w / 2, ay = a.y + a.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
    const mx = (ax + bx) / 2, my = (ay + by) / 2;
    const k = mode === 'orbit' ? 0.28 : 0.16;
    links.push({ ...l, path: `M${ax} ${ay} Q${mx - (by - ay) * k} ${my + (bx - ax) * k} ${bx} ${by}` });
  });
  const ex = (extra || []).flatMap(e => [e.x - 230, e.x + 230]);
  const ey = (extra || []).flatMap(e => [e.y - 60, e.y + 60]);
  const xs = items.flatMap(i => [i.x, i.x + i.w]).concat(channels.flatMap(c => [c.x ?? 0, (c.x ?? 0) + (c.w || 0)])).concat(ex);
  const ys = items.flatMap(i => [i.y, i.y + i.h]).concat(channels.flatMap(c => [c.y ?? 0, (c.y ?? 0) + (c.h || 0)])).concat(ey);
  const pad = mode === 'orbit' ? 70 : 160;
  const bbox = { x0: Math.min(...xs) - pad, y0: Math.min(...ys) - pad,
    x1: Math.max(...xs) + pad, y1: Math.max(...ys) + pad };
  return { items, channels, hub, links, pos, bbox, mode, regions: [], bands: [] };
}
