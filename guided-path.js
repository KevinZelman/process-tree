// Guided-path data. Two kinds of content, kept strictly separate:
//   VERBATIM  — tables lifted word-for-word from the SOP source documents.
//   PATCH     — authored here to close a gap the Coverage panel identified.
//               Every patch is labelled in the UI as authored, not sourced.


/* PATCH — tier identity. The source documents say "Tier 1..4" and nothing else,
   which means nothing to a reader who has not been told what those are. These
   are the department's own names. Colours are fixed per tier and used
   everywhere a tier is named, so the tier is recognisable before it is read.
   Each colour carries white text at 4.5:1 or better. */
export const TIERS = {
  1: { num:1, name:'Front Door technicians / Automated Step', short:'Front Door technicians',
       color:'#0F7B6C', soft:'#E4F2EF',
       does:'Holds the front door. Resolves what can be finished with the access they already have, and everything an automated step can close without a person.' },
  2: { num:2, name:'Technical Support Services', short:'Technical Support',
       color:'#2F6FDB', soft:'#E6EEFB',
       does:'A person is affected and it needs hands on the device or elevated access. The default destination when Tier 1 cannot finish it.' },
  3: { num:3, name:'Expert Technical Services', short:'Expert Technical',
       color:'#5B3FA8', soft:'#EDE8F7',
       does:'A system is affected rather than a person — servers, tenancy, infrastructure, anything where fixing it for one person fixes it for everyone.' },
  4: { num:4, name:'IT Management', short:'IT Management',
       color:'#D64545', soft:'#FBE6EA',
       does:'Anything waiting on money, risk or permission. Tier 4 decides; it does not queue work behind a fix.' }
};
export const tierOf = n => TIERS[Number(String(n).replace(/[^\d]/g, ''))] || null;
export const tierLabel = n => { const t = tierOf(n); return t ? 'Tier ' + t.num + ' · ' + t.name : String(n); };

/* PATCH — priority is not tier. The two numbering schemes sit side by side in
   the source and are routinely confused. Stated once, plainly, wherever both
   appear. */
export const PRIORITY_VS_TIER = {
  priority:'P1 to P4 is how urgent it is — it sets the clock, and nothing else.',
  tier:'Tier 1 to Tier 4 is who does the work — it sets the destination.',
  both:'They are independent. A P1 can sit with Tier 1 and a P4 can sit with Tier 4. Decide urgency first, then decide who.'
};

export const STATIONS = [
  { id:'symptom',  name:'Substance',  sub:'What is this about?',          src:'Written for this tool', doc:null },
  { id:'ticket',   name:'Ticket',     sub:'Handled means ticketed',       src:'The front-door rule', doc:'GOV-02' },
  { id:'incident', name:'Screen',     sub:'Is this a security incident?', src:'The incident test', doc:'GOV-03' },
  { id:'ours',     name:'Classify',   sub:'Is it ours?',                  src:'The who-does-what list', doc:'GOV-02' },
  { id:'priority', name:'Prioritise', sub:'P1 to P4',                     src:'The priority ladder', doc:'GOV-06' },
  { id:'verify',   name:'Verify',     sub:'Who am I speaking to?',        src:'The four ways to prove identity', doc:'ACC-06' },
  { id:'resolve',  name:'Resolve',    sub:'Work the procedure',           src:'The catalogue', doc:null },
  { id:'close',    name:'Close',      sub:'Outcome and record',           src:'The five ways a ticket ends', doc:'GOV-06' }
];

/* PATCH — responsibility areas. Intake is deliberately not modelled: the
   catalogue records no channel on any document, and how a request arrived does
   not change whether it is ours or what the procedure says. What matters is the
   substance. Each area groups the request and operations categories below. */
export const AREAS = [
  { id:'identity', label:'Identity & access', short:'IDENTITY & ACCESS', ours:true,
    cats:['Access & sign-in', 'Joiners & leavers', 'Identity feed', 'Privileged & service accounts'] },
  { id:'collab', label:'Collaboration', short:'COLLABORATION', ours:true,
    cats:['Email & calendar', 'Files & sharing', 'Teams & meetings'] },
  { id:'estate', label:'Devices & estate', short:'DEVICES & ESTATE', ours:true,
    cats:['Device & hardware', 'Software, print & rooms', 'Estate & calendar cycle'] },
  { id:'security', label:'Security & compliance', short:'SECURITY & COMPLIANCE', ours:true,
    cats:['Detection & response', 'Misuse, review & compliance'] },
  { id:'governance', label:'Governance & change', short:'GOVERNANCE & CHANGE', ours:true,
    cats:['Change & release', 'Requests & governance', 'Recurring review'] },
  { id:'notours', label:'Not ours — redirect', short:'NOT OURS', ours:false,
    cats:['Not ours'] }
];

export function areaOf(cat) {
  const a = AREAS.find(x => x.cats.includes(cat));
  return a ? a.id : 'governance';
}

/* Every indexed entry, request and operation alike, as one list. Origin is kept
   only as a note on the card — it no longer routes anything. */
export function allWork() {
  const out = [];
  SYMPTOMS.forEach(s => out.push({ q:s.q, cat:s.cat, sop:s.sop, desk:s.desk,
    why:s.why, area:areaOf(s.cat), kind:'request' }));
  OPERATIONS.forEach(o => out.push({ q:o.q, cat:o.cat, sop:o.sop,
    area:areaOf(o.cat), kind:'operation', origin:o.origin }));
  return out;
}

/* PATCH 1a — origin classes (retained: the guided path still names how work
   reaches the desk as context on a card, but it no longer decides anything). The catalogue documents procedures; it never says
   how work reaches the desk. Reactive user requests are one of six origins, and
   four of them never produce a caller at all. */
export const ORIGINS = [
  { id:'person',   label:'A person asked us',
    sub:'Portal, email, phone, walk-up, or a Teams message that turned into work.',
    tier:'Tiers 1–2', kind:'symptom' },
  { id:'system',   label:'A system raised it',
    sub:'A monitoring alert, an MDR detection, a risky sign-in, a compliance flag. Nobody reported it.',
    tier:'Tiers 2–3', kind:'ops' },
  { id:'record',   label:'A record changed upstream',
    sub:'HR or the records owner set a date. The work is triggered by the feed, not by a request.',
    tier:'Tier 2', kind:'ops' },
  { id:'calendar', label:'The calendar says so',
    sub:'A recertification, a review cycle, a patch window, the start of a busy season. Scheduled, recurring, owned.',
    tier:'Tiers 3–4', kind:'ops' },
  { id:'tier',     label:'Another tier escalated it to me',
    sub:'It arrived with history. The ticket already exists and the clock is already running.',
    tier:'Any tier', kind:'symptom' },
  { id:'change',   label:'We are changing something on purpose',
    sub:'A planned change, a maintenance window, a new application, a tenant configuration.',
    tier:'Tiers 3–4', kind:'ops' }
];

/* PATCH 1b — the operations index: work that is not a user request. Each entry
   is the trigger in the desk's own words, mapped to the SOP that owns it. */
export const OPERATIONS = [
  // system-raised
  { origin:'system', cat:'Detection & response', q:'The MDR or security agent flagged a device', sop:'DEV-14' },
  { origin:'system', cat:'Detection & response', q:'A risky sign-in or impossible-travel alert fired', sop:'ACC-03' },
  { origin:'system', cat:'Detection & response', q:'Repeated lockouts on one account', sop:'ACC-05' },
  { origin:'system', cat:'Detection & response', q:'A phishing campaign was detected in the tenant', sop:'M365-22' },
  { origin:'system', cat:'Detection & response', q:'A device reported non-compliant', sop:'DEV-02' },
  { origin:'system', cat:'Detection & response', q:'A machine is failing its patch baseline', sop:'DEV-13' },
  { origin:'system', cat:'Detection & response', q:'BitLocker escrow is missing for a device', sop:'DEV-03' },
  { origin:'system', cat:'Detection & response', q:'Credential sharing or sale is indicated', sop:'ACC-15' },
  { origin:'system', cat:'Detection & response', q:'A mailbox rule or delegation appeared that nobody requested', sop:'GOV-03' },

  // upstream record
  { origin:'record', cat:'Identity feed', q:'HR posted a new hire with a start date', sop:'ACC-01' },
  { origin:'record', cat:'Identity feed', q:'HR posted a separation date', sop:'ACC-01' },
  { origin:'record', cat:'Identity feed', q:'A department or title change came through', sop:'ACC-01' },
  { origin:'record', cat:'Identity feed', q:'A retirement or affiliate status was recorded', sop:'ACC-12' },
  { origin:'record', cat:'Identity feed', q:'A temporary-worker appointment started or ended', sop:'ACC-09' },
  { origin:'record', cat:'Identity feed', q:'A record exists in the applicable business system but no account was created', sop:'ACC-01' },
  { origin:'record', cat:'Identity feed', q:'A name change was recorded', sop:'M365-05' },
  { origin:'record', cat:'Identity feed', q:'A contractor or vendor engagement ended', sop:'ACC-11' },

  // calendar
  { origin:'calendar', cat:'Recurring review', q:'Access recertification is due', sop:'ACC-17' },
  { origin:'calendar', cat:'Recurring review', q:'Privileged account review is due', sop:'ACC-07' },
  { origin:'calendar', cat:'Recurring review', q:'Service account credentials are due for rotation', sop:'ACC-08' },
  { origin:'calendar', cat:'Recurring review', q:'Guest and external account review is due', sop:'ACC-10' },
  { origin:'calendar', cat:'Recurring review', q:'A document in the catalogue is due for review', sop:'GOV-01' },
  { origin:'calendar', cat:'Recurring review', q:'The knowledge base needs its staleness review', sop:'GOV-05' },
  { origin:'calendar', cat:'Recurring review', q:'Ticket ageing and commitment review is due', sop:'GOV-06' },
  { origin:'calendar', cat:'Estate & calendar cycle', q:'The patch cycle is due', sop:'DEV-13' },
  { origin:'calendar', cat:'Estate & calendar cycle', q:'Busy-season start — meeting room and lab readiness', sop:'DEV-18' },
  { origin:'calendar', cat:'Estate & calendar cycle', q:'Busy-season start — lab image refresh', sop:'DEV-06' },
  { origin:'calendar', cat:'Estate & calendar cycle', q:'Hardware refresh cycle is due', sop:'DEV-04' },
  { origin:'calendar', cat:'Estate & calendar cycle', q:'Device disposal or retirement batch is due', sop:'DEV-15' },
  { origin:'calendar', cat:'Estate & calendar cycle', q:'Licence true-up or renewal is due', sop:'M365-20' },
  { origin:'calendar', cat:'Estate & calendar cycle', q:'Legacy file-share retirement milestone', sop:'M365-13' },
  { origin:'calendar', cat:'Estate & calendar cycle', q:'Teams and SharePoint ownership expiry review', sop:'M365-07' },
  { origin:'calendar', cat:'Estate & calendar cycle', q:'Distribution list and shared mailbox owner review', sop:'M365-04' },

  // deliberate change
  { origin:'change', cat:'Change & release', q:'A tenant configuration change is proposed', sop:'M365-21' },
  { origin:'change', cat:'Change & release', q:'We need a maintenance window', sop:'GOV-04' },
  { origin:'change', cat:'Change & release', q:'An emergency change is needed right now', sop:'GOV-04' },
  { origin:'change', cat:'Change & release', q:'A new application needs SSO and provisioning', sop:'ACC-16' },
  { origin:'change', cat:'Change & release', q:'A new service is being brought under IT support', sop:'M365-01' },
  { origin:'change', cat:'Change & release', q:'A data classification or handling decision is needed', sop:'M365-15' },
  { origin:'change', cat:'Change & release', q:'A Copilot or AI capability is being enabled', sop:'M365-18' },
  { origin:'change', cat:'Change & release', q:'A Power Automate or Power Apps solution needs review', sop:'M365-19' },
  { origin:'change', cat:'Change & release', q:'A device standard or naming standard needs changing', sop:'ACC-02' },
  { origin:'change', cat:'Change & release', q:'Software needs packaging and deployment', sop:'DEV-11' },
  { origin:'change', cat:'Change & release', q:'A policy or SOP in the catalogue needs amending', sop:'GOV-01' },
  { origin:'change', cat:'Change & release', q:'Mac management scope is changing', sop:'DEV-09' },
  { origin:'change', cat:'Change & release', q:'A BYOD or personal-device policy question needs deciding', sop:'DEV-07' },
  { origin:'change', cat:'Change & release', q:'An eDiscovery hold or export is required', sop:'M365-16' },
  { origin:'change', cat:'Change & release', q:'A mass-communication channel is being set up', sop:'M365-06' }
];

/* PATCH 1c — how each origin lands in the ticket system. The front-door rule covers
   channels a person uses; it is silent on work nobody reported. */
export const ORIGIN_LOG = {
  system:   ['raise', 'Raise the ticket from the alert', 'The detection is the report. Log it against the affected asset or identity so the commitments have a start time.'],
  record:   ['raise', 'Raise the ticket from the feed', 'The upstream date is the trigger. ACC-01 works to HR’s date, so log it against that date, not the day you noticed.'],
  calendar: ['task',  'A scheduled task, not a ticket', 'Owned recurring work. It needs a task with an owner and a due date; individual remediations that fall out of it become their own tickets.'],
  change:   ['change','A change record, not a ticket', 'GOV-04 governs it. A change carries an approver, a window and a rollback position — a ticket has none of those.'],
  tier:     ['exists','The ticket already exists', 'It arrived with history. Do not open a second one; the clock started when the requester first reported it.']
};

/* PATCH 1 — the symptom index. The catalogue is organised by document; callers
   speak in symptoms. Nothing in the source maps one to the other. */
export const SYMPTOMS = [
  { cat:'Access & sign-in', q:'I can’t sign in / my password isn’t working', sop:'ACC-05', why:'Triage to a confirmed cause A–E before touching the password.' },
  { cat:'Access & sign-in', q:'My account is locked out', sop:'ACC-05' },
  { cat:'Access & sign-in', q:'I forgot my password', sop:'ACC-04', why:'Self-service first — it removes the need for verification entirely.' },
  { cat:'Access & sign-in', q:'I never get the MFA prompt / code', sop:'ACC-05', why:'Cause C. Do not reset the password.' },
  { cat:'Access & sign-in', q:'I got a new phone and lost my Authenticator', sop:'ACC-03' },
  { cat:'Access & sign-in', q:'I need to add or change an MFA method', sop:'ACC-03', why:'Highest-risk account action in the catalogue.' },
  { cat:'Access & sign-in', q:'It works on my laptop but not from home', sop:'ACC-05', why:'Cause B or D — read the sign-in log, not the password.' },
  { cat:'Access & sign-in', q:'I get a policy or compliance message when I sign in', sop:'ACC-05', why:'Cause D — Conditional Access.' },
  { cat:'Access & sign-in', q:'I can sign in but one app won’t let me in', sop:'ACC-05', why:'Cause E — licence, group, or the application itself.' },
  { cat:'Access & sign-in', q:'Someone else has been signing in as me', sop:'GOV-03', why:'Do not reset. This is an incident.' },
  { cat:'Access & sign-in', q:'I need access to a system for my new role', sop:'ACC-01', why:'Use the Mover procedure.' },
  { cat:'Access & sign-in', q:'I need an admin account / local admin on my machine', sop:'DEV-12' },

  { cat:'Joiners & leavers', q:'A new person starts on Monday', sop:'ACC-01', why:'Use the Joiner procedure. HR states the start date, not IT.' },
  { cat:'Joiners & leavers', q:'Someone is leaving / has left', sop:'ACC-01', why:'Use the Leaver procedure. Keep the mailbox at least two years.' },
  { cat:'Joiners & leavers', q:'Someone is changing department', sop:'ACC-01', why:'Use the Mover procedure.' },
  { cat:'Joiners & leavers', q:'A departed person is asking for access', sop:'ACC-06', why:'Do not action. Route to Tier 4.' },
  { cat:'Joiners & leavers', q:'I need an account for a temporary worker', sop:'ACC-09' },
  { cat:'Joiners & leavers', q:'I need an account for a vendor or consultant', sop:'ACC-11' },
  { cat:'Joiners & leavers', q:'I need a guest / external account', sop:'ACC-10' },
  { cat:'Joiners & leavers', q:'What happens to a retiree’s account?', sop:'ACC-12' },

  { cat:'Email & calendar', q:'I need a shared mailbox', sop:'M365-03' },
  { cat:'Email & calendar', q:'I need access to a shared mailbox', sop:'M365-03', why:'Never granted directly — it must acquire a named owner.' },
  { cat:'Email & calendar', q:'I need to delegate my mailbox or calendar', sop:'ACC-14' },
  { cat:'Email & calendar', q:'My name changed — I need a new email address', sop:'M365-05', why:'HR confirmation first.' },
  { cat:'Email & calendar', q:'I need a distribution list', sop:'M365-04' },
  { cat:'Email & calendar', q:'I want to email everyone at the organization', sop:'M365-06', why:'Six offices may approve; IT is not one of them alone.' },
  { cat:'Email & calendar', q:'I want to forward my work email elsewhere', sop:'M365-02', why:'External forwarding is the one hard rule.' },
  { cat:'Email & calendar', q:'I got a suspicious email', sop:'M365-22' },
  { cat:'Email & calendar', q:'I clicked a link and entered my password', sop:'GOV-03', why:'Credentials on a phishing page is an incident, not a ticket.' },

  { cat:'Files & sharing', q:'I need a SharePoint site', sop:'M365-10' },
  { cat:'Files & sharing', q:'I can’t get to a folder I used to have', sop:'M365-11' },
  { cat:'Files & sharing', q:'The Z: or Y: drive is gone', sop:'M365-13' },
  { cat:'Files & sharing', q:'I need to share a file with someone outside the organization', sop:'M365-14' },
  { cat:'Files & sharing', q:'Is this data allowed in OneDrive?', sop:'M365-12' },
  { cat:'Files & sharing', q:'How should this data be classified?', sop:'M365-15' },
  { cat:'Files & sharing', q:'Legal / HR is asking for an export or a hold', sop:'M365-16', why:'Director level requests it. No tenant access is granted.' },
  { cat:'Files & sharing', q:'A file was shared too widely', sop:'M365-11', why:'If it was shared internally and you have already fixed it, this is not a security incident. Run the incident test first to be sure.' },

  { cat:'Teams & meetings', q:'I need a Team created', sop:'M365-07' },
  { cat:'Teams & meetings', q:'The owner of our Team has left', sop:'M365-07' },
  { cat:'Teams & meetings', q:'I need to record a meeting / add an external guest', sop:'M365-08' },
  { cat:'Teams & meetings', q:'My desk phone or voicemail isn’t working', sop:'M365-09' },

  { cat:'Device & hardware', q:'I need a new computer', sop:'DEV-04' },
  { cat:'Device & hardware', q:'Set up this machine for me', sop:'DEV-01' },
  { cat:'Device & hardware', q:'I need a loaner', sop:'DEV-05' },
  { cat:'Device & hardware', q:'My laptop is asking for a BitLocker recovery key', sop:'DEV-03' },
  { cat:'Device & hardware', q:'I lost my laptop / it was stolen', sop:'DEV-16', why:'Escrow position decides whether this becomes a GOV-03 incident.' },
  { cat:'Device & hardware', q:'I want work email on my personal phone', sop:'DEV-08' },
  { cat:'Device & hardware', q:'Can I use my own computer for work?', sop:'DEV-07' },
  { cat:'Device & hardware', q:'I need remote access / VPN', sop:'DEV-10' },
  { cat:'Device & hardware', q:'This machine is being replaced — what happens to it?', sop:'DEV-15' },
  { cat:'Device & hardware', q:'My Mac needs managing', sop:'DEV-09' },

  { cat:'Software, print & rooms', q:'I need software installed', sop:'DEV-11' },
  { cat:'Software, print & rooms', q:'The printer isn’t working', sop:'DEV-17' },
  { cat:'Software, print & rooms', q:'The meeting-room AV isn’t working', sop:'DEV-18', why:'A meeting or session in progress that cannot proceed is P1.' },
  { cat:'Software, print & rooms', q:'A lab or shared machine has a problem', sop:'DEV-06' },
  { cat:'Software, print & rooms', q:'I need a Form or a Bookings page', sop:'M365-17' },
  { cat:'Software, print & rooms', q:'Can I use Copilot for this?', sop:'M365-18' },
  { cat:'Software, print & rooms', q:'I want to build a Power Automate flow', sop:'M365-19' },

  { cat:'Requests & governance', q:'I need a licence assigned', sop:'M365-20' },
  { cat:'Requests & governance', q:'I want a change made to the tenant', sop:'M365-21' },
  { cat:'Requests & governance', q:'We need a maintenance window', sop:'GOV-04' },
  { cat:'Requests & governance', q:'This ticket has been open too long', sop:'GOV-06' },
  { cat:'Requests & governance', q:'I want to write this answer down for next time', sop:'GOV-05' },
  { cat:'Requests & governance', q:'Who owns this procedure?', sop:'GOV-01' },

  { cat:'Privileged & service accounts', q:'I need an admin or privileged account', sop:'ACC-07' },
  { cat:'Privileged & service accounts', q:'I need a service or non-human account for an application', sop:'ACC-08' },
  { cat:'Privileged & service accounts', q:'What is this account allowed to be called?', sop:'ACC-02' },
  { cat:'Privileged & service accounts', q:'Why does a temporary worker have two accounts?', sop:'ACC-02-BRIEF' },
  { cat:'Privileged & service accounts', q:'We are onboarding a new application — it needs SSO', sop:'ACC-16' },

  { cat:'Misuse, review & compliance', q:'Someone is sharing their credentials', sop:'ACC-15' },
  { cat:'Misuse, review & compliance', q:'I need an account suspended for misuse or academic integrity', sop:'ACC-13' },
  { cat:'Misuse, review & compliance', q:'It is time for the access review / recertification', sop:'ACC-17' },
  { cat:'Misuse, review & compliance', q:'Is this device allowed on the network?', sop:'DEV-02' },
  { cat:'Misuse, review & compliance', q:'The security agent flagged something on a device', sop:'DEV-14' },
  { cat:'Misuse, review & compliance', q:'This machine is behind on patches', sop:'DEV-13' },

  { cat:'Requests & governance', q:'Is this service even supported by IT?', sop:'M365-01' },
  { cat:'Requests & governance', q:'How should I log or categorise this ticket?', sop:'GOV-02' },

  { cat:'Not ours', q:'My pay, benefits, leave or HR paperwork', desk:'HR' },
  { cat:'Not ours', q:'An invoice, an expense claim or a purchase', desk:'Finance' },
  { cat:'Not ours', q:'A door badge, a key, or something broken in the building', desk:'Facilities or physical security' },
  { cat:'Not ours', q:'A contract, a legal question or a privacy request', desk:'Legal or compliance' },
  { cat:'Not ours', q:'Something about our clients or services that isn’t a tech problem', desk:'the department that owns it' },
  { cat:'Not ours', q:'I don’t know who handles this', desk:'whichever department the staff directory lists' }
];

/* PATCH 2 — inference rules. Everything the symptom already determines is set
   from the index instead of asked. Each inference is shown in the rail and can
   be overridden by clicking that station. */
/* Which procedure inside the document this symptom actually starts in.
   Matched against the flow's own section name, so it survives re-extraction. */
const FLOW_HINT = [
  [/leaving|has left|separation date|engagement ended/, /leaver/i],
  [/changing department|title change/,        /mover/i],
  [/new person starts|new hire|no account was created|appointment started/, /joiner/i],
  [/risky sign-in or impossible-travel/,      /risky sign-in|impossible travel/i],
  [/repeated lockouts/,                       /cause by cause/i],
  [/emergency change/,                        /emergency/i],
  [/ownership expiry review/,                 /orphan|expiry|ownership/i],
  [/retirement or affiliate/,                  /retiree|affiliate/i],
  [/lost my authenticator|new phone/,         /risky sign-in|recovery|impossible travel/i],
  [/add or change an mfa method/,             /enrollment|enrolment/i],
  [/forgot my password/,                      /self-service/i],
  [/password isn.t working|locked out/,       /cause by cause/i],
  [/need access to a shared mailbox/,         /provisioning/i],
  [/i need a shared mailbox/,                 /requesting/i],
  [/owner of our team has left/,              /orphan|expiry|ownership/i],
  [/retiree/,                                 /retiree|affiliate/i],
  [/lost my laptop|was stolen/,               /first hour/i]
];

export function flowIndex(sym, doc) {
  if (!doc || !doc.flows || doc.flows.length < 2) return 0;
  const q = (sym.q || '').toLowerCase();
  for (const [when, want] of FLOW_HINT) {
    if (!when.test(q)) continue;
    const i = doc.flows.findIndex(f => want.test(f.name));
    if (i >= 0) return i;
  }
  return 0;
}

/* Inference for non-request work. No caller, so no ACC-06 verification unless
   the procedure itself touches an identity; priority comes from the operation's
   own nature rather than from anyone's description of it. */
export function inferOps(op, doc, origin) {
  const q = (op.q || '').toLowerCase();
  let pri = 7;                                              // scheduled/new work, P4
  if (origin === 'system') {
    pri = /mdr|security agent|credential sharing|rule or delegation|phishing/.test(q) ? 0 : 4;
  } else if (origin === 'record') {
    pri = /separation|retirement|contractor|vendor engagement ended/.test(q) ? 4 : 6;
  } else if (origin === 'change') {
    pri = /emergency change/.test(q) ? 2 : 8;
  }
  const identity = /^ACC-/.test(op.sop || '')
    || ['M365-05','M365-16'].includes(op.sop);
  return { pri, needVerify:origin === 'system' && identity, flowIdx:flowIndex(op, doc) };
}

export function infer(sym, doc) {
  const q = (sym.q || '').toLowerCase(), cat = sym.cat || '';

  let pri = 6;                                            // degraded, P3
  if (/class(room)? av|in session/.test(q)) pri = 1;      // class cannot proceed, P1
  else if (/whole department|everyone at the organization/.test(q)) pri = 3;
  else if (/can.t sign in|locked out|never get the mfa|lost my authenticator|forgot my password|won.t let me in|signing in as me|clicked a link/.test(q)) pri = 4;
  else if (/^i need|^i want|^set up|^can i|^how should|^is this data/.test(q)) pri = 7;
  else if (/legal|hr is asking|hold|export/.test(q)) pri = 2;

  const identity = /^ACC-/.test(sym.sop || '')
    || cat === 'Access & sign-in' || cat === 'Joiners & leavers'
    || ['M365-03','M365-05','M365-14','M365-16','DEV-16','DEV-12'].includes(sym.sop);

  return { pri, needVerify:identity, flowIdx:flowIndex(sym, doc) };
}

/* VERBATIM — GOV-02, the front-door table. `ticket` is how the path reads
   each row: does a ticket already exist, must one be raised, or is this not a
   queue at all. */
export const CHANNEL_STATUS = [
  ['the service desk address', 'The published address. Everything arriving here becomes a ticket.', 'exists'],
  ['The service portal', 'Preferred, because it can require the mandatory ticket fields at the point of submission rather than chasing them afterwards.', 'exists'],
  ['Walk-up', 'Legitimate and valuable. Still creates a ticket, logged by whoever helped.', 'raise'],
  ['Phone', 'Legitimate. Still creates a ticket.', 'raise'],
  ['Teams message to an individual', 'Not a queue. Fine for a quick question; if it becomes work, it becomes a ticket.', 'maybe'],
  ['Direct email to a named IT staff member', 'Not a queue. Redirect to the front door, politely, and explain why once.', 'redirect'],
  ['the Tier 2 escalation address / the Tier 3 escalation address / the IT management address', 'Internal escalation addresses, not community addresses. Users do not contact Tier 3 directly.', 'redirect']
];

/* VERBATIM — GOV-03 */
export const INCIDENT_TEST = [
  ['Confirmed or suspected account compromise.', 'A single failed sign-in from an unfamiliar location.'],
  ['Credentials entered into a phishing page.', 'A phishing message reported and purged with no interaction (M365-22).'],
  ['Malware or ransomware indication on any device.', 'A blocked download or a quarantined attachment.'],
  ['Unauthorised access to, or disclosure of, personal or institutional data.', 'A file shared too widely internally and corrected (M365-11).'],
  ['A lost or stolen device holding organization data with no confirmed escrow.', 'A misplaced device found the same day, still encrypted and escrowed (DEV-16).'],
  ['Anything with a regulatory clock — applicable privacy law (e.g. HIPAA, FERPA, GDPR), or state breach notification.', 'A policy violation with no data exposure (ACC-15, ACC-13).'],
  ['Confirmed credential sharing or sale.', 'A third lockout where nothing suggests anyone else was involved — that is a repeat-lockout case, not an incident.'],
  ['Suspected social engineering against the service desk.', 'A verification correctly declined and logged (ACC-06).']
];

/* VERBATIM — GOV-06, in order. First true line wins. */
export const PRIORITY_TEST = [
  ['A Organization-wide system is down, or there is a security incident, suspected compromise or data exposure.', 'P1', 'declare it in the ticket and the tier channel'],
  ['A meeting or session is under way right now and cannot proceed.', 'P1', ''],
  ['A legal or regulatory clock is running.', 'P1', 'and tell Tier 4'],
  ['A whole department cannot do its work.', 'P2', ''],
  ['One person is completely blocked and has no workaround.', 'P2', ''],
  ['A room is down and a session is booked in it within 24 hours.', 'P2', ''],
  ['One person is working but impaired, or a room is down with no class due soon.', 'P3', ''],
  ['It is a standard access or permission request.', 'P3', ''],
  ['Something new is being asked for, or the requester agrees it can wait.', 'P4', 'scheduled by agreement']
];

/* VERBATIM — GOV-06, what each clock actually measures. Plain language,
   straight from the source — this is what "acknowledge" means. */
export const CLOCKS = [
  ['Acknowledged and owned', 'From arrival to the moment a named person at the correct tier has the ticket and the requester has been told so. This is the department’s primary commitment.'],
  ['Next update', 'The maximum interval the requester will go without hearing something. An update may be “no progress, here is why, here is when we next look” — that is a legitimate update and is far better than silence.']
];

/* VERBATIM — GOV-06 The state changes what you owe the requester, so it has
   to be asked before you promise anything. */
export const CAPACITY = [
  ['NORMAL', 'Nothing unusual today.', 'Nothing changes. Every priority keeps its normal promises: P1 acknowledged in 15 minutes, P2 in 4 working hours, P3 in 1 working day, P4 in 3 working days.', 'Nobody — this is the default'],
  ['CONSTRAINED', 'The tier has more open tickets than it can carry, or someone is out and nobody is covering for them.', 'Urgent work is unaffected: P1 and P2 keep their normal promises. P3 stretches — acknowledge within 3 working days and update weekly instead of every 3 days. P4 gets no promised date at all; accept it, queue it, and say so.', 'Your tier lead, posted in the tier channel.'],
  ['DEGRADED', 'A major incident is running, two or more people are out, or a planned system cutover is under way.', 'Only P1 and P2 are worked. Acknowledge a P3 honestly — say it is queued and that you cannot give a date. Do not accept P4 at all; ask them to send it again once things are back to normal.', 'IT management, posted to the community as well as in Teams.']
];

/* PATCH — the actual words. A junior technician needs a sentence to send, not a
   table to interpret. Authored; edit freely to match how your desk writes. */
export const REPLY = {
  P1:'I have your ticket and I am working on it now. This is our highest priority. I will update you every hour until the service is back.',
  P2:'I have your ticket and it is assigned to me. I will update you at least once a day. I do not have a fix time yet — I will give you a plan and an expected date within two working days.',
  P3:'I have your ticket and it is in the queue. I will update you at least every three working days. There is no fixed completion date; it is scheduled against what the team has available.',
  P4:'I have your ticket. This is a new request rather than something broken, so there is no target date — let us agree one now and I will hold to it.'
};

/* PATCH — plain-English gloss of the jargon in the commitment table. */
export const PLAIN = [
  ['Acknowledge', 'Tell the requester, in writing, that you have their ticket and that you own it. That is the whole thing. It does not mean you have fixed it or even started.'],
  ['Working hours', 'The hours your tier is actually staffed — not clock hours. A 4-hour target starting at 4pm is met the next morning, not at 8pm. GOV-06 states the real hours per tier.'],
  ['How often you update them', 'The longest the requester should ever wait to hear from you. “No progress yet, here is why, here is when I next look” counts as an update, and the source says it beats silence.'],
  ['Promised fix time', 'Below P1 there is no promised fix time. IT controls acknowledgement and ownership; it often does not control when a vendor, a part or a decision elsewhere arrives.']
];

/* Applies the tier capacity state to the standard commitments. */
export function commitments(pri, state) {
  const base = (COMMITMENTS[pri] || []).slice();
  if (!base.length || !state || state === 'NORMAL') return { rows:base, changed:false };
  if (state === 'CONSTRAINED') {
    if (pri === 'P3') return { rows:['Within 3 working days.', 'Weekly.', base[2]], changed:true };
    if (pri === 'P4') return { rows:['No promised date — accept it, queue it, and say so.', base[1], base[2]], changed:true };
  }
  if (state === 'DEGRADED') {
    if (pri === 'P3') return { rows:['Acknowledge it, and say honestly that it is queued with no date.', base[1], base[2]], changed:true };
    if (pri === 'P4') return { rows:['Not accepted today — ask them to send it again once things are back to normal.', base[1], base[2]], changed:true };
  }
  return { rows:base, changed:false };
}

/* VERBATIM — GOV-06 commitments. */
export const COMMITMENTS = {
  P1: ['15 minutes within working hours. 1 hour outside working hours, for outage and security only.', 'Hourly until mitigated, then daily until closed.', 'Mitigate within 4 hours, or Tier 4 takes the decision.'],
  P2: ['4 working hours.', 'Daily.', 'No target. A stated plan with an expected date within 2 working days.'],
  P3: ['1 working day.', 'Every 3 working days.', 'No target. Scheduled against available capacity.'],
  P4: ['3 working days.', 'On state change, or fortnightly.', 'By agreement with the requester at acknowledgement.']
};

/* VERBATIM — GOV-02 */
export const REDIRECTION = [
  ['Pay, benefits, leave, personnel records', 'HR', false],
  ['Invoices, expenses, purchasing, budgets', 'Finance', false],
  ['Building access, badges, keys, physical safety, broken fixtures', 'Facilities or physical security', false],
  ['Contracts, legal questions, privacy requests, compliance', 'Legal or compliance', false],
    ['Your organization’s own clients, services or programmes, where nothing in IT is broken', 'The department that owns it. Look it up in the staff directory.', false],
  ['Meeting room AV', 'Ours — Tiers 1 and 2', true],
  ['Accounts, devices, Microsoft 365, governance', 'Ours — the catalogue', true]
];

/* VERBATIM — ACC-06 */
export const VERIFY_TIERS = [
  ['V1', 'In person', 'Government or staff photo ID presented at the desk, checked against the directory record.', 'Strongest, and often the fastest. Default for anyone on site and mandatory for privileged accounts.'],
  ['V2', 'Live video call', 'Camera on, face visible, photo ID held to the camera, plus two directory facts the requester volunteers without being told which ones you want.', 'The standard remote path. Remote staff, remote users, anyone off site.'],
  ['V3', 'Vouching by a known party', 'The requester’s manager or department head confirms identity from their own work account, on the ticket.', 'The requester cannot do V1 or V2.'],
  ['V4', 'Callback to the directory number', 'Call the number in the directory record — never a number the requester supplies — plus two volunteered directory facts.', 'Fallback only. Never alone for a privileged account or for an MFA method change.']
];

/* VERBATIM — ACC-06, the do-not-action list. */
export const DO_NOT_ACTION = [
  'A request from an outside email address, even one that names the account holder correctly',
  'A request made by a third party on the account holder’s behalf, unless that third party is the manager using V3',
  'A request where the facts arrive only after you say what you need',
  'A request that is urgent and also declines verification',
  'Adding a new MFA method while an existing method remains registered and reachable',
  'Any disclosure of account state to an unverified caller — including whether an account exists',
  'Anything at all where you feel pressured, hurried, or that something is off'
];

/* VERBATIM — ACC-05 Appendix triage card. Runs only for sign-in symptoms. */
export const LOCKOUT_CARD = [
  ['Does it fail everywhere, immediately, including on site?', 'Cause A — AD lockout. Escalate to unlock, then hunt the stale credential.', 'A'],
  ['Does it work from somewhere else, or on another device?', 'Cause B — smart lockout. Read the source IP address. If the location is unfamiliar, treat it as a risky sign-in and escalate rather than resetting.', 'B'],
  ['Is the password accepted, and then the second factor never arrives?', 'Cause C — MFA method. Do NOT reset. Verify per ACC-06, escalate for re-registration.', 'C'],
  ['Did they get a specific policy or compliance message?', 'Cause D — Conditional Access. Read the log; fix the condition, not the password.', 'D'],
  ['Does sign-in succeed, but one app denies them?', 'Cause E — not a lockout. Reclassify: licence, group, or application.', 'E'],
  ['Are they saying somebody else has been signing in?', 'Stop. Do not reset the password — that warns the intruder and ends nothing. Tier 2 first.', ''],
  ['Has this account been here before in the last 90 days?', 'Go to Appendix B before restoring.', '']
];

/* VERBATIM — GOV-06 A ticket is resolved only in one of these ways. */
export const OUTCOMES = [
  ['Fixed', 'The requester confirms it, or three working days pass after you told them it was fixed and they did not reply. Not simply when you believe it is fixed.'],
  ['Redirected', 'The department that owns it has it and the redirection is logged. Redirecting a ticket correctly counts as resolving it.'],
  ['Mitigated (P1 only)', 'Service is back. That is not the same as finished — the ticket stays open, with a daily update, until the underlying cause is dealt with.'],
  ['Will-not-do', 'A Tier 4 decision is recorded and the requester has been told, with a reason.'],
  ['Duplicate or withdrawn', 'Linked to the surviving ticket, or the requester has withdrawn it.']
];

/* VERBATIM — GOV-03 severities, used when the incident path is taken. */
export const SEVERITIES = [
  ['S1', 'Organization-wide impact, ransomware, confirmed exposure of personal data, or any regulatory clock running.', 'Head of IT', 'Immediately'],
  ['S2', 'Confirmed compromise of one or more accounts or devices, contained, with no confirmed data exposure.', 'Tier 3, Head of IT informed within the hour', 'Same day'],
  ['S3', 'Suspected compromise under investigation; or a pattern across several accounts not yet confirmed.', 'Tier 3', 'Monthly report unless it escalates'],
  ['S4', 'Attempted attack, unsuccessful. Includes social engineering against the desk.', 'Tier 2, recorded and circulated', 'Monthly report']
];

export const INCIDENT_FIRST_MOVES = [
  'Separate what is known from what is assumed. Write both down.',
  'Declare, with a severity. Appoint a lead by name. When in doubt, declare.',
  'Start the timeline — one document, times against entries.',
  'Preserve — sign-in logs, mailbox audit, rules, delegations, consents. Export; do not rely on retention.',
  'Contain — disable sign-in, revoke sessions AND tokens, isolate devices. A password reset alone does not end a live session.',
  'Assess scope — what else did this identity or device touch?',
  'Notify the people the severity requires. An S1 goes to executive leadership immediately, even with incomplete information.',
  'Then remediate. Check for attacker-created MFA methods — the step most often missed.'
];

/* VERBATIM — GOV-05 The third occurrence of a question is the trigger. */
export const ARTICLE_RULE = [
  'Tier 1 or Tier 2 flags the third occurrence, against the ticket category (GOV-02). The flag is a field, not a conversation, and it takes ten seconds.',
  'The flag creates one article task with a named owner and a due date.',
  'The default owner is the tier that resolves the ticket, because they already know the answer.',
  'Answer the third ticket normally. The article does not hold up the person who asked; it prevents the fourth person needing to.',
  'Publish within ten working days of the flag. Then reply to the requester with the link.'
];

/* VERBATIM — GOV-06 The fixed list a Tier 4 decision must come from. */
export const AGED_DECISIONS = [
  ['Re-prioritise', 'The priority was wrong. Set the correct one and the corresponding commitments apply from now.'],
  ['Reassign', 'It is at the wrong tier or the wrong person. Move it; history travels with it.'],
  ['Accept with a date', 'It is genuinely queued behind higher-impact work. Give the requester a real date and hold it. This is the honest answer for most aged P3s.'],
  ['Close as will-not-do', 'The organization is not going to do this. Say so, with a reason, to the requester.'],
  ['Redirect', 'It was never IT’s. Send it to the department that owns it, from the staff directory, and log the redirection.']
];

/* VERBATIM — GOV-02 Modern practice calls this functional escalation; the
   source already has it as a four-question test. Used by "I can't resolve this". */
export const TIER_TEST = [
  ['Can I finish it with what I already have access to?',
   'Then it is yours — keep it.', null],
  ['Is a person affected, and does it need hands on the device or elevated access?',
   'Tier 2 — Technical Support Services.', 2],
  ['Is a system affected rather than a person?',
   'Tier 3 — Expert Technical Services.', 3],
  ['Am I waiting on money, risk or permission?',
   'Tier 4 — IT Management. They decide; they do not queue behind a fix.', 4],
  ['Does this belong to IT at all?',
   'Redirect to the owning department, from the staff directory, and log it.', 0]
];

/* VERBATIM — GOV-06 The notice ladder. Three notices in a ticket's life, no more. */
export const NOTICE_LADDER = [
  'At 75% of an acknowledgement target: one notice to the assignee. Nobody else.',
  'At the target: one notice to the tier lead. Not repeated — the tier lead now owns the decision and repetition adds nothing.',
  'On a second missed update in a row on the same ticket: one notice to Tier 4, who must choose from a fixed list — re-prioritise, reassign, accept with a date, close as will-not-do, or redirect.',
  'No ticket generates more than three automated notices in its lifetime. Backlog age is a weekly report, not an alert stream.'
];

/* PATCH — handoff contents. The source says history travels with a reassignment
   but never says what a handoff must contain. Modern practice requires it. */
export const HANDOFF = [
  'What the requester reported, in their words',
  'What you have already tried, and what it did',
  'The confirmed cause if you reached one, or the causes you ruled out',
  'Verification level already completed, so it is not repeated',
  'Priority and the commitment already given to the requester',
  'What specifically you are blocked on — access, money, risk, or permission'
];

/* PATCH — station help. What each station is for and why it runs where it does. */
export const STATION_HELP = {
  symptom:  'One list of everything the department is responsible for. Intake is not asked because no document records it and it changes nothing — what the work is decides whether it is ours, and what the procedure says.',
  ticket:   'If the department is handling it, it has a ticket — user request, alert, or scheduled task alike. GOV-06 measures every commitment from a ticket timestamp, so no ticket means no clock and nothing afterwards is measurable.',
  incident: 'An incident abandons the normal path — priority, tier and commitments all become subordinate to GOV-03. Screening first is cheaper than discovering it at step nine.',
  ours:     'Redirecting a ticket to the right desk counts as resolving it — it is a real outcome, not a failure. Four of the six categories below are not IT’s work at all.',
  priority: 'Priority comes from impact and scope, never from how urgently it was described. Read the list top to bottom and take the first line that is true.',
  verify:   'ACC-06 is mandatory before any account action, with no seniority exemption. Verification precedes restoration — not the other way round.',
  resolve:  'The steps are the source document, verbatim. Gates offer both branches so you never have to infer what the document meant.',
  close:    'A ticket is resolved in one of five ways and no others. Then the knowledge check and, if a commitment was missed, a Tier 4 decision.'
};

/* PATCH — glossary. Short definitions for the terms the path uses as shorthand. */
export const GLOSSARY = {
  P1:'Organization-wide outage, security incident, a class that cannot go ahead, or a legal deadline running. Acknowledged within 15 minutes.',
  P2:'A department blocked, or one person blocked with no workaround. Acknowledged within 4 working hours.',
  P3:'Working but impaired, or a standard access request. Acknowledged within 1 working day.',
  P4:'New requests, or anything the requester agrees can wait. Acknowledged within 3 working days.',
  V1:'In person with photo ID, checked against the directory.',
  V2:'Live video, camera on, photo ID to camera, plus two volunteered directory facts.',
  V3:'Manager or department head vouches from their own work account, on the ticket.',
  V4:'Callback to the directory number — never a number the requester supplies.',
  S1:'Organization-wide impact, ransomware, confirmed personal-data exposure, or a regulatory clock. Head of IT immediately.',
  S2:'Confirmed compromise, contained, no confirmed exposure. Tier 3, Head of IT within the hour.',
  S3:'Suspected compromise under investigation. Tier 3.',
  S4:'Attempted attack, unsuccessful. Tier 2, recorded and circulated.',
  'Tier 1':'Front Door technicians / Automated Step. Holds the front door and resolves what it can finish with the access it already has.',
  'Tier 2':'Technical Support Services. A person is affected and it needs hands on the device or elevated access.',
  'Tier 3':'Expert Technical Services. A system is affected rather than a person.',
  'Tier 4':'IT Management. Anything waiting on money, risk or permission.',
  'P1':'A priority, not a tier. How urgent the work is — it sets the clock, not who does it.',
  'P2':'A priority, not a tier. A department blocked, or one person blocked with no workaround.',
  'P3':'A priority, not a tier. Working but impaired, or a standard access request.',
  'P4':'A priority, not a tier. New requests, or anything the requester agrees can wait.'
};

export const TICKET_FIELDS = [
  ['Submitter', 'Matched to the directory, not free text.'],
  ['Tier', 'Every time. The field the whole service-commitment model runs on.'],
  ['Priority', 'From impact and scope, not from how urgently it was described.'],
  ['Category', 'From the list. Free text cannot be reported on.'],
  ['Confirmed cause', 'ACC-05 A–E, for access tickets.'],
  ['Verification level', 'V1–V4, for account actions. The ticket does not close without it. Not the same as Tier 1–4.']
];
