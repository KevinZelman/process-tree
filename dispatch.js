/* DISPATCH — the working layer for "Walk a ticket".

   The earlier walk asked seven questions before the technician did anything,
   and none of them filled a ticket field. This file inverts that: one answer
   (what is this about) already decides category, procedure, owning tier,
   priority, whether it is ours and whether it is an incident. Everything else
   on the card is handed over, not asked.

   Rules this file follows:
   1. A question exists only if it fills a field or changes the route.
   2. Anything settled earlier never reappears.
   3. Scripts are written out, per audience, ready to copy.
   4. Instructions to the technician are pitched at their own tier.          */

/* ── Who you are talking to. Sets the outgoing script only. ─────────────── */
export const REGISTERS = [
  { id:'plain',  label:'Most people',        sub:'Short and friendly, no jargon' },
  { id:'simple', label:'Keep it very simple', sub:'English as a second language, or nervous about technology' },
  { id:'steps',  label:'Just the steps',      sub:'They will not read a paragraph' },
  { id:'full',   label:'Explain it fully',    sub:'They want to understand it, or need it in writing' },
  { id:'formal', label:'Brief and formal',    sub:'Senior staff — respect their time, skip the hand-holding' },
  { id:'tech',   label:'Technical',           sub:'Another IT person — name the systems' }
];

/* ── The places you send people. Microsoft's own self-service pages work for
   any Microsoft 365 tenant; the help center holds the six self-service guides.
   Swap in your own portal links here. ──────────────────────────────────── */
export const LINKS = {
  sspr:    { url:'https://aka.ms/sspr',     name:'Reset your own password' },
  mfa:     { url:'https://aka.ms/MFAsetup', name:'Set up or change sign-in methods' },
  myapps:  { url:'https://myapps.microsoft.com/',
             name:'myApps — everything they can sign into' },
  outlook: { url:'https://outlook.office.com',
             name:'Email on the web' },
  kb:      { url:'help.html',
             name:'Self-service guides — the help center' }
};

/* The intake template — what to ask for, in this order, if a request arrives
   without it. Put the same fields on your own request form. */
export const INTAKE_TEMPLATE = ['Name', 'Location', 'Device', 'Category', 'Description'];

/* The nine categories the request form offers. A ticket raised by hand should
   use one of these, so the reporting lines up with what arrives by form or email. */
export const INTAKE_CATEGORIES = ['Access', 'Meeting', 'MFA', 'Password', 'Printer',
  'Meeting room', 'Hardware', 'WiFi', 'Other'];

/* Tools most desks already have, surfaced at the step where they help rather
   than left in a README. */
export const TOOLS = {
  whyLocked:{ name:'Lockout source lookup — Entra sign-in logs, or Account Lockout Status for on-premises AD',
    note:'Tells you what caused it — a bad password and from which device, a network failure, or a disabled account. Faster than guessing, and it gives you the cause for the ticket field.' },
  whyDisabled:{ name:'Directory audit log — who or what disabled it',
    note:'Says whether a security service disabled it automatically, a tool did, or a person did. Answer this before you re-enable anything.' },
  studentLookup:{ name:'User lookup — your directory or admin center',
    note:'Look the person up by email or ID to see their account state, licences and groups before you reply.' }
};

/* ── How much shorthand the technician gets. Their tier, not the user's. ── */
export const TECH_LEVEL = {
  1: { label:'Front Door technicians / Automated Step', style:'Exact clicks, plain words, and a clear point to stop.' },
  2: { label:'Technical Support Services',   style:'Normal support shorthand.' },
  3: { label:'Expert Technical Services',    style:'Terse. Systems named, no click paths.' },
  4: { label:'IT Management',                    style:'Terse. Decision and risk only.' }
};

/* ── Job packs. Ordered by how often the front line sees them. ───────────
   safe: 'self'   — the requester can finish this themselves
         'yours'  — whoever picked this up can finish it
         'stop'   — do not work it; escalate now, and do not warn the user
   ask:  extra questions, each one naming the field it fills. Most jobs: none. */
export const JOBS = [
{
  id:'signin', q:'I can’t sign in / my password isn’t working',
  cat:'Access & sign-in', kcat:'PASSWORD reset', sop:'ACC-05', tier:1, pri:'P2', safe:'self',
  links:['sspr'], tools:['whyLocked'],
  ask:[{ id:'cause', field:'Confirmed cause', label:'Before anything — which is it?',
    opts:[
      { v:'A — forgotten or expired password', then:'self', kcat:'PASSWORD reset' },
      { v:'B — locked out by repeated wrong attempts', then:'yours', kcat:'Account Services', tier:2 },
      { v:'C — sign-in works elsewhere but not here', then:'yours', kcat:'ACCESS issues' },
      { v:'D — a policy or compliance message appears', then:'yours', kcat:'ACCESS issues' },
      { v:'E — signs in fine, one app refuses', then:'yours', kcat:'ACCESS issues' },
      { v:'They say someone else has been signing in', then:'stop', kcat:'Account Services', tier:2 }
    ] }],
  say:{
    plain:'Happy to help. You can reset this yourself at aka.ms/sspr — it will text or prompt your phone to confirm it is you, then let you set a new password. If that does not work, tell me what it says and I will take it from there.',
    simple:'I can help.\n\n1. Go to aka.ms/sspr\n2. Type your work email address\n3. Your phone will get a message. Confirm it.\n4. Make a new password.\n\nIf it does not work, send me a photo of the screen.',
    steps:'1. aka.ms/sspr\n2. Enter your work email\n3. Confirm on your phone\n4. Set a new password\n\nStuck? Reply and I will call you.',
    full:'Your password either expired or was entered incorrectly enough times to lock the account — both are common and neither means anything is wrong with your account.\n\nYou can fix it yourself at aka.ms/sspr. It will ask for your work email address, then confirm it is really you using the phone number or app you registered. Once confirmed, you can set a new password. It takes about two minutes and works from any device, including your phone.\n\nA new password applies everywhere you sign in with your work account — email, business apps, site computers. If you are signed in on a phone it may ask you to sign in again there.\n\nIf the reset page does not recognise you, or the confirmation never arrives, reply to this and I will reset it for you directly.',
    formal:'You can reset this yourself at aka.ms/sspr — it confirms your identity by phone, then lets you set a new password. If it does not go through, reply and I will handle it directly.',
    tech:'SSPR is enabled for your account — aka.ms/sspr, verify against your registered method, set a new password. If it does not go through, reply and I will take it from there.'
  },
  close:{
    plain:'You are back in. If anything else is still asking for the old password, sign out and back in once and it will catch up.',
    simple:'It works now.\n\nIf your phone still asks for the old password, sign out and sign in again.',
    steps:'Fixed. Sign out and back in on your phone if it still asks for the old password.',
    full:'Your password is reset and your account is unlocked. Anything you are already signed into may keep working on the old session for a while; signing out and back in once will bring it up to date. If it locks again within a day or two, tell me — that usually means a saved password on a device is retrying the old one, and I can help you find it.',
    formal:'Reset and confirmed working. If any device still prompts for the old password, sign out and back in once.',
    tech:'Password reset, lockout cleared. Cached credentials on enrolled devices may retry the old secret — sign out/in once to re-auth.'
  },
  do:{
    1:['Ask them to try aka.ms/sspr while you are with them — most calls end here.',
       'If they say someone else has been signing in, stop. Do not reset it. Pass it to Tier 2 straight away.',
       'If the reset page will not recognise them, confirm who you are speaking to before you do anything else.',
       'Write the cause you confirmed (A to E) in the ticket. It is a required field.'],
    2:['Confirm cause A–E before touching the account. Do not reset on a suspected compromise.',
       'Verify identity to the required level before any account action — no exemption for seniority.',
       'SSPR first; direct reset only if SSPR fails. Record the cause and the verification level.'],
    3:['Triage to a cause, verify, then act. Check sign-in logs before resetting if the source IP is unfamiliar.'],
    4:['Only involved if this is a compromise or a policy exception.']
  }
},
{
  id:'lockout', q:'My account is locked out',
  cat:'Access & sign-in', kcat:'Account Services', sop:'ACC-05', tier:2, pri:'P2', safe:'yours',
  links:[], tools:['whyLocked'], ask:[],
  say:{
    plain:'Your account is locked. I have logged it and passed it to the colleague who can unlock it, so you do not need to do anything else. We will let you know as soon as it is working.',
    simple:'Your account is locked.\n\nI have told my colleague. They can unlock it.\n\nYou do not need to do anything. We will tell you when it works.',
    steps:'1. Logged\n2. Passed to the colleague who can unlock it\n3. We will tell you when it works',
    full:'Your account is locked. Unlocking it needs permissions held by our Account Services team, so I have logged it and passed it straight to them with everything I found. You do not need to do anything else.\n\nOnce it is unlocked, if it locks again soon afterwards, tell us rather than trying repeatedly. That usually means a phone, laptop or saved connection still has an old password and keeps retrying it, and we can help find which one.',
    formal:'The account is locked. I have passed it to Account Services, who hold the permissions to unlock it. No action is needed from you; we will confirm when it is working.',
    tech:'Account lockout — passed to Account Services (Tier 2) for the unlock. If it re-locks, look for a stale credential: a phone mail client, a mapped drive with a saved password, or a scheduled task.'
  },
  close:{
    plain:'Your account is unlocked. If it locks again, tell us rather than retrying — there is usually a saved old password on a phone or laptop behind it.',
    simple:'Your account works now.\n\nIf it locks again, tell us.',
    steps:'Unlocked. If it locks again, tell us.',
    full:'Your account is unlocked. If it locks again, please tell us rather than retrying. A repeat usually means a saved old password somewhere — a phone mail app, a mapped drive, or a scheduled task — and finding it is the actual fix.',
    formal:'Unlocked and confirmed. If it recurs, please tell us; a saved credential is the usual cause.',
    tech:'Unlocked. If it recurs, hunt the stale credential source (ACC-05).'
  },
  do:{
    1:['Unlocking is Tier 2’s job (Account Services). Do not try to work around it.',
       'If you have the organization Account Manager, run “Why locked out?” and paste the result into the owner’s notes.',
       'Set the category to «T1 ESCALATION» with owner’s notes, so Tier 2 files it as Account Services.',
       'Tell the user it has been passed on and they do not need to do anything.'],
    2:['Unlock, then hunt the stale credential — a phone mail client, a mapped drive with a saved old password, or a scheduled task (ACC-05).',
       'File it as Account Services.'],
    3:['Not normally involved.'],
    4:['Not involved.']
  }
},
{
  id:'newphone', q:'I got a new phone and lost my Authenticator',
  cat:'Access & sign-in', kcat:'Account Services', sop:'ACC-03', tier:2, pri:'P2', safe:'yours',
  links:['mfa'], ask:[],
  say:{
    plain:'This is a common one. Your old phone held the app that proves it is you, so the old phone needs to be cleared from your account before the new one can be added. We will confirm who you are first, then clear it, and you will set up the new phone at aka.ms/MFAsetup.',
    simple:'This happens often.\n\nYour old phone proved it was you. We need to remove the old phone first.\n\n1. We check who you are\n2. We remove the old phone\n3. You go to aka.ms/MFAsetup on a computer\n4. You add Microsoft Authenticator on the new phone',
    steps:'1. We confirm your identity\n2. We clear the old phone\n3. You go to aka.ms/MFAsetup\n4. Add Microsoft Authenticator on the new phone',
    full:'When you sign in, the organization asks for your password and a confirmation from something you have — here, the Microsoft Authenticator app on your old phone. Your new phone is not registered yet, which is why sign-in fails even though your password is right.\n\nThe old registration has to be cleared before the new phone can be added. Because that registration is what protects your account, we confirm who you are before clearing it. That is not doubt about you; it is the step that stops someone else claiming to have a new phone.\n\nOnce it is cleared, go to aka.ms/MFAsetup on a computer and add Microsoft Authenticator on the new phone. While you are there, add a second method such as a phone number — if you lose a phone again, that second method is your way back in.',
    formal:'Your old registration needs clearing before the new phone can be added. We will verify your identity, clear it, and you can then register the new phone at aka.ms/MFAsetup. A second method is worth adding at the same time.',
    tech:'MFA method is bound to the lost device. Identity verification, then the stale method is deleted and you re-register at aka.ms/MFAsetup. Add a backup method so a lost phone is not a hard lock next time.'
  },
  close:{
    plain:'Your new phone is set up. Please add a second method — a phone number is fine — so a lost phone will not lock you out next time.',
    simple:'Your new phone works now.\n\nPlease add one more way to sign in. A phone number is fine.',
    steps:'Done. Add a backup method at aka.ms/MFAsetup.',
    full:'Your new phone is registered and sign-in is working. Please add a second sign-in method at aka.ms/MFAsetup, such as a phone number. With only one method, a lost or broken phone means you cannot sign in without us; with two, you can recover on your own.',
    formal:'Registered and confirmed working. A second method at aka.ms/MFAsetup would let you recover without us next time.',
    tech:'New method registered, stale method removed. Register a backup factor for self-recovery.'
  },
  do:{
    1:['Resetting MFA is Tier 2’s job (Account Services). Your part is identity and the hand-up.',
       'Confirm who you are speaking to first — call back on the directory number, never one you were given (ACC-06).',
       'Record how you verified them in the owner’s notes, then set «T1 ESCALATION».',
       'Tell them what happens next: once the old phone is cleared, they set up the new one at aka.ms/MFAsetup.'],
    2:['Verify to the required level, delete the stale method, and have them re-register at aka.ms/MFAsetup. Record the verification level.',
       'Ask them to add a second method before you close it.'],
    3:['Not involved unless identity cannot be established.'],
    4:['Not involved.']
  }
},
{
  id:'nomfa', q:'I never get the MFA prompt or code',
  cat:'Access & sign-in', kcat:'ACCESS issues', sop:'ACC-05', tier:1, pri:'P2', safe:'yours',
  links:['mfa'],
  ask:[],
  say:{
    plain:'Let us check what your account is set to send. Usually the prompt is going to an old phone, or notifications are switched off for the app. I can see which method is registered and we will fix it from there.',
    simple:'The message is probably going to your old phone.\n\nI will check which phone your account uses. Then we will change it to the right one.',
    steps:'1. I check which method is registered\n2. We point it at your current phone\n3. You confirm the test prompt',
    full:'Sign-in sends the confirmation to whichever method your account has registered. When the prompt never arrives, it is nearly always one of three things: it is going to a phone you no longer use, notifications are turned off for the Microsoft Authenticator app, or the phone has no signal or data at that moment.\n\nI can see which method is registered on your account, so we will start there and correct it if it is pointing at the wrong device. If it is the right device, check that notifications are enabled for the Authenticator app in your phone settings — that is the most common cause when the registration itself is correct.',
    formal:'The prompt is likely going to a method you no longer use, or notifications are off for the app. I can see what is registered and will correct it.',
    tech:'Check the registered methods — likely a stale default or notifications disabled on the Authenticator install. Re-point the default method and test.'
  },
  close:{
    plain:'Sorted — the prompt is now going to the right phone. Keep a second method registered so you are never stuck.',
    simple:'It works now. The message goes to the right phone.',
    steps:'Fixed. Prompt now goes to your current phone.',
    full:'Your account now sends the confirmation to your current phone and we have tested it. If prompts ever stop arriving again, the first thing to check is notifications for the Authenticator app, since a phone update can switch them off without warning. Having a second method registered at aka.ms/MFAsetup means that is an inconvenience rather than a lockout.',
    formal:'Corrected and tested. A second registered method would prevent a recurrence becoming a lockout.',
    tech:'Default method re-pointed and tested. Recommend a backup factor.'
  },
  do:{
    1:['Check which method their account has registered before troubleshooting the phone.',
       'If the registered phone is one they no longer have, this is the lost-Authenticator job — verify them first.',
       'If the registration is right, have them check notifications are on for the Authenticator app.'],
    2:['Inspect registered methods, re-point the default, test. Notifications-off is the usual cause when registration is correct.'],
    3:['Check Conditional Access is not the actual cause before blaming the method.'],
    4:['Not involved.']
  }
},
{
  id:'appdenied', q:'I can sign in but one app won’t let me in',
  cat:'Access & sign-in', kcat:'ACCESS issues', sop:'ACC-05', tier:2, pri:'P3', safe:'yours',
  links:['myapps'], tools:['studentLookup'],
  ask:[{ id:'which', field:'Category', label:'Which app?',
    opts:[{ v:'the LMS', then:'yours' }, { v:'Email / Outlook', then:'yours' },
          { v:'The staff portal', then:'yours' }, { v:'Something else', then:'yours' }] }],
  say:{
    plain:'Good news — this is not your password, since sign-in itself is working. It is almost always a permission for that one app. I am checking what you should have access to and will get it added.',
    simple:'Your password is fine.\n\nThis is about permission for one app only.\n\nI will check what you should be able to use, and add it.',
    steps:'1. Sign-in confirmed working\n2. I check your access for that app\n3. I add what is missing\n4. You sign out and back in',
    full:'Because you can sign in, your password and your account are both fine — the problem is narrower than it feels. Access to individual applications is granted separately, usually through membership of a group tied to your role or department. When one app refuses you while everything else works, it means that specific grant is missing or has not caught up yet.\n\nI am checking what your role should have, and I will request or add what is missing. Once it is in place, sign out fully and back in — application access is read at sign-in, so it will not appear until you do.',
    formal:'Sign-in is working, so this is an application permission rather than an account problem. I am confirming what your role should have and will arrange it. A full sign-out and back in will be needed once granted.',
    tech:'Auth succeeds, authorisation fails — not a lockout. Checking group membership and licence assignment for that app. Token refresh needed after the grant lands.'
  },
  close:{
    plain:'Access is in place. Sign out fully and back in once and you will see it.',
    simple:'You can use the app now.\n\nPlease sign out. Then sign in again.',
    steps:'Granted. Sign out and back in to see it.',
    full:'The access has been granted. You will need to sign out completely and sign back in before it appears, because your permissions are read at sign-in and your current session still holds the old set. If it still refuses after that, tell me the exact message you see — the wording distinguishes a missing licence from a missing group, and they are fixed differently.',
    formal:'Granted. A full sign-out and back in is required for it to take effect.',
    tech:'Grant applied. Full re-auth required to pick up the new claim. If it still denies, send the exact error — distinguishes licence from group.'
  },
  do:{
    1:['This one is not yours to fix. Confirm sign-in works, note which app, and pass it to Tier 2.',
       'Getting the exact wording of the error saves Tier 2 a call back.'],
    2:['Reclassify — this is not a lockout. Check licence, group membership, then the application itself, in that order.',
       'Record it against the right category or it will not report correctly.'],
    3:['Check the app registration and Conditional Access scope if licence and group are both correct.'],
    4:['Only if it needs a licence purchase.']
  }
},
{
  id:'compromise', q:'Someone else has been signing in as me',
  cat:'Access & sign-in', kcat:'Account Services', sop:'GOV-03', tier:2, pri:'P1', safe:'stop',
  links:[], tools:['whyDisabled'],
  ask:[{ id:'exec', field:'Route', label:'Is the account holder an executive?',
    sub:'Executive = C-suite and executive-level employees (VIPs), department leads, system administrators, etc.',
    opts:[
      { v:'No', then:'stop', kcat:'Account Services' },
      { v:'Yes — executive', then:'stop', kcat:'Security incident',
        do:{ 1:['Stop. Do not reset anything, and do not tell them it is being treated as an incident.',
                'Set the category to Tier 4 “Security incident”, and email the service desk address with the subject “SECURITY INCIDENT” — your knowledge base’s route for an executive compromise.',
                'Write down exactly what they told you, in their words.'],
             2:['Executive compromise goes to Tier 4 as a Security incident. Hand it up now; do not start remediation yourself.'],
             3:['Tier 4 owns this. Support on request.'],
             4:['You own this. Security incident response (GOV-03).'] } }
    ] }],
  say:{
    plain:'Thank you for telling us — you did exactly the right thing, and quickly. I am escalating this now. Please do not change your password yet; I will come back to you shortly with what to do, and someone will stay with this until it is resolved.',
    simple:'Thank you for telling us. You did the right thing.\n\nPlease wait. Do not change your password yet.\n\nI am getting help now. Someone will contact you very soon.',
    steps:'1. Reported — thank you\n2. Do not change your password yet\n3. Stay available; we will call you shortly',
    full:'Thank you for reporting this, and for doing it quickly — that genuinely matters here.\n\nI am escalating this immediately. One request in the meantime: please do not change your password yet. That sounds counter-intuitive, so here is why. If someone is currently signed in as you, changing the password does not remove them from the session they already hold, and it does tell them they have been noticed. We want to close their access and preserve what we need to understand what happened, and the order matters.\n\nSomeone will contact you shortly. If you notice anything else in the meantime — a message you did not send, a file you did not move — write it down rather than deleting it.',
    formal:'Thank you for the prompt report. I am escalating this immediately. Please do not change your password until we contact you — doing so does not end an existing session and does alert the intruder. You will hear from us shortly.',
    tech:'Treating as suspected account compromise. Holding off on the reset until sessions can be revoked in the right order — a password change alone does not kill an active refresh token and does tip off the actor. Escalating now; preserve any evidence.'
  },
  close:{
    plain:'Handled and confirmed closed. If you see anything else unusual, report it the same way — that report was the reason this was caught.',
    simple:'This is finished. Your account is safe.\n\nIf you see something strange again, tell us the same way.',
    steps:'Closed. Report anything else the same way.',
    full:'This has been investigated and closed. Your account access has been secured and the sessions involved were ended. If you see anything else out of place, report it the same way you did this time — that report is the reason this was caught early, and it is far better to raise something that turns out to be nothing than to leave something unreported.',
    formal:'Investigated and closed. Account secured and sessions revoked. Please continue to report anything unusual through the same route.',
    tech:'Closed. Sessions revoked, credentials rotated, sign-in logs reviewed. Continue to report anomalies through the same channel.'
  },
  do:{
    1:['Stop. Do not reset the password. Do not tell the user it is being escalated as an incident.',
       'Pass it to Tier 2 now — say the words "suspected compromise" so it is not queued as a reset.',
       'Write down exactly what they told you, in their words.'],
    2:['Do not reset first. Revoke sessions, then rotate credentials — a reset alone leaves an active session and warns the actor.',
       'Declare it. Severity decides who is told and how fast. Declare high if unsure; coming back down is cheap.',
       'Preserve evidence before remediating.'],
    3:['Contain, preserve, then remediate. Check for mailbox rules, forwarding, and OAuth grants added during the window.'],
    4:['Notification obligations run on severity. A Organization-wide or data-exposure case goes to executive leadership immediately, incomplete information and all.']
  }
},
{
  id:'phish', q:'I clicked a link and entered my password',
  cat:'Email & calendar', kcat:'Account Services', sop:'GOV-03', tier:2, pri:'P1', safe:'stop',
  links:[],
  ask:[{ id:'exec', field:'Route', label:'Is the account holder an executive?',
    sub:'Executive = C-suite and executive-level employees (VIPs), department leads, system administrators, etc.',
    opts:[
      { v:'No', then:'stop', kcat:'Account Services' },
      { v:'Yes — executive', then:'stop', kcat:'Security incident',
        do:{ 1:['Stop. Do not reset anything, and do not tell them it is being treated as an incident.',
                'Set the category to Tier 4 “Security incident”, and email the service desk address with the subject “SECURITY INCIDENT” — your knowledge base’s route for an executive compromise.',
                'Write down exactly what they told you, in their words.'],
             2:['Executive compromise goes to Tier 4 as a Security incident. Hand it up now; do not start remediation yourself.'],
             3:['Tier 4 owns this. Support on request.'],
             4:['You own this. Security incident response (GOV-03).'] } }
    ] }],
  say:{
    plain:'Thank you for telling me straight away — that is the single most useful thing you could have done, and you are not in trouble. I am getting this handled right now. Stay at your computer if you can and someone will come back to you shortly.',
    simple:'Thank you for telling me. This was the right thing to do.\n\nYou are not in trouble. This happens to many people.\n\nPlease stay at your computer. Someone will contact you soon.',
    steps:'1. Reported — thank you, and you are not in trouble\n2. Stay at your computer\n3. Someone will come back to you shortly',
    full:'Thank you for telling me immediately. I want to be clear that you are not in trouble — these messages are built specifically to catch careful people on a busy day, and reporting it this fast is what limits the damage.\n\nI am escalating this now so we can secure the account before anything can be done with those credentials. Please stay reachable for the next few minutes. Do not delete the message you clicked — we need it to see what else was sent and who else received it.\n\nYou may be asked to confirm your identity and re-register your sign-in methods. That is routine for this, not a sign that something worse has happened.',
    formal:'Thank you for the immediate report — that is what limits exposure here, and there is no fault on your part. I am escalating now to secure the account. Please stay reachable, and do not delete the original message; we need it to assess reach.',
    tech:'Credential phishing, credentials submitted. Escalating for session revocation and credential rotation. Preserving the original message for header analysis and to scope other recipients. Check for inbox rules and OAuth consent added since.'
  },
  close:{
    plain:'All handled. You did the right thing by reporting it fast — please keep doing exactly that.',
    simple:'This is finished. Your account is safe.\n\nThank you for telling us quickly. Please always do this.',
    steps:'Closed. Keep reporting these the same way.',
    full:'This is closed. The account was secured, and we checked what else the message reached so other people could be protected too. Reporting it within minutes is what made that possible.\n\nOne thing for next time, and this is not a criticism: the quickest tell on these is the address bar rather than the message itself. If a page asks for your work password and the address is not a Microsoft or your domain address, close it. If you are ever unsure, forwarding it to us takes ten seconds and we would far rather look at ten harmless messages than miss one.',
    formal:'Closed. Account secured and the message scoped for other recipients. Your prompt report is what enabled that.',
    tech:'Closed. Sessions revoked, credentials rotated, tenant-wide search completed for other recipients, no persistence found. Reported through the standard route.'
  },
  do:{
    1:['Stop. Do not reset the password yourself. Pass to Tier 2 now, saying "credentials entered on a phishing page".',
       'Tell the user they are not in trouble — it is why people report fast.',
       'Ask them not to delete the message.'],
    2:['Revoke sessions first, then rotate. Preserve the message before anything else.',
       'Declare it. Check for mailbox rules, forwarding and OAuth grants added since.',
       'Scope other recipients across the tenancy — assume they were not the only target.'],
    3:['Contain, preserve, scope the blast radius, then remediate.'],
    4:['Severity sets notification. Confirmed exposure of personal data goes to executive leadership immediately.']
  }
},
{
  id:'suspmail', q:'I got a suspicious email',
  cat:'Email & calendar', kcat:'GENERAL guidance', sop:'M365-22', tier:1, pri:'P3', safe:'self',
  links:[],
  ask:[{ id:'clicked', field:'Confirmed cause', label:'Did they click, or enter anything?',
    opts:[{ v:'No — just received it', then:'self' },
          { v:'Clicked, but entered nothing', then:'yours', kcat:'Malware cleanup', tier:2 },
          { v:'Entered a password or details', then:'stop', kcat:'Account Services', tier:2 }] }],
  say:{
    plain:'Thanks for checking rather than guessing — that is exactly right. Use the Report button in Outlook and that sends us everything we need. Then delete it. If you did click anything in it, tell me now.',
    simple:'Thank you for asking. This is the right thing to do.\n\n1. In Outlook, use the Report button\n2. Then delete the email\n\nDid you click anything in the email? Please tell me.',
    steps:'1. Report it in Outlook\n2. Delete it\n3. Tell me if you clicked anything',
    full:'Thanks for checking — that instinct is worth more than any filter we run.\n\nUse the Report button in Outlook rather than forwarding it. Reporting sends the message with its full technical headers, which is what lets us see where it came from and search whether anyone else received it. A forward strips most of that away.\n\nOnce reported, delete it. And if you clicked a link or entered anything at all, tell me now rather than later — that changes what we do, and speed matters much more than certainty.',
    formal:'Thank you for checking. Please use the Report button in Outlook rather than forwarding — it preserves the headers we need to scope it. Delete it afterwards. Do tell me if anything was clicked or entered.',
    tech:'Report via the Outlook add-in rather than forwarding — keeps headers intact for analysis and tenant-wide scoping. Confirm no click-through or credential submission.'
  },
  close:{
    plain:'Reported and cleared. Keep doing exactly that — it is how we catch these early.',
    simple:'Finished. Thank you.\n\nPlease always report emails like this.',
    steps:'Closed. Keep reporting them.',
    full:'Reported and dealt with. Reports like yours are how these get caught before they spread, so please keep sending them — there is no such thing as wasting our time with one of these. If a message ever asks for your password and the address bar is not Microsoft or your domain, close it and report it.',
    formal:'Reported and closed. Please continue to report these — early reports are what contain them.',
    tech:'Reported, analysed, tenant-wide scope checked. Continue routing through the add-in.'
  },
  do:{
    1:['Received only: report and delete, and you can close it.',
       'Clicked but entered nothing: pass to Tier 2 to be sure.',
       'Entered a password: this is the phishing job. Stop and escalate now.'],
    2:['Confirm no credential submission. Check headers, scope other recipients.'],
    3:['Tenant-wide search, rule and forwarding check if there was any interaction.'],
    4:['Only on confirmed exposure.']
  }
},
{
  id:'newrole', q:'I need access to a system for my new role',
  cat:'Joiners & leavers', kcat:'Account Services', sop:'ACC-01', tier:2, pri:'P3', safe:'yours',
  links:['myapps'],
  ask:[{ id:'approval', field:'Category', label:'Is the manager’s approval already on the ticket?',
    opts:[{ v:'Yes — approval attached', then:'yours' },
          { v:'No — not yet', then:'yours' }] }],
  say:{
    plain:'I can get that moving. Access like this needs your manager’s sign-off, so I will request it if it is not already on the ticket, and set things up as soon as it comes back. I will tell you when it is ready rather than leaving you wondering.',
    simple:'I can help with this.\n\nFirst your manager must approve it.\n\nI will ask them. When they say yes, I will set it up.\n\nI will send you a message when it is ready.',
    steps:'1. Manager approval needed\n2. I request it\n3. I set up the access\n4. I confirm when it is ready',
    full:'I can start this now. Access tied to a role needs your manager’s approval before it can be granted — that is not a formality, it is the record of who authorised what, and it is what allows the access to be reviewed later.\n\nIf the approval is not already on the ticket I will request it, and I will set the access up as soon as it comes back. The waiting time is nearly always the approval rather than the work.\n\nWhen it is ready you will need to sign out completely and back in before the new access appears. I will confirm when that point is reached, rather than leaving you to guess.',
    formal:'This requires your manager’s approval, which I will request if it is not already attached. I will action it as soon as that returns and confirm when it is live. A full sign-out and back in will be needed to pick it up.',
    tech:'Role-based grant, needs approval on the ticket before provisioning. I will request it, then assign the group and licence. Full re-auth needed to pick up the new claims.'
  },
  close:{
    plain:'Access is set up. Sign out fully and back in once and it will be there.',
    simple:'The access is ready.\n\nPlease sign out. Then sign in again.',
    steps:'Done. Sign out and back in.',
    full:'The access is in place, approved and recorded against your role. Sign out completely and back in for it to appear — permissions are read at sign-in, so your current session still holds the old set.\n\nIf you find you are still missing something specific, tell me what you were trying to do rather than what you think you need. It is usually faster to work back from the task, and it avoids granting more than the role should carry.',
    formal:'Provisioned and recorded against your role. A full sign-out and back in is required. If something is still missing, describe the task rather than the permission and I will work back from it.',
    tech:'Group and licence assigned, approval recorded. Full re-auth required. Report gaps by task, not by requested permission.'
  },
  do:{
    1:['Not yours to grant. Raise it, confirm whether manager approval is attached, and pass to Tier 2.',
       'Asking for the approval up front is the single thing that speeds this up.'],
    2:['No approval, no grant — the approval is the audit record, not a formality.',
       'Grant by role, not by copying a colleague’s access.'],
    3:['Only if it needs a new group or an application-side change.'],
    4:['If it needs a licence purchase or carries a risk exception.']
  }
},
{
  id:'joiner', q:'A new person starts on Monday',
  cat:'Joiners & leavers', kcat:'Account Services', sop:'ACC-01', tier:2, pri:'P3', safe:'yours',
  links:[],
  ask:[],
  say:{
    plain:'I can set that up. HR sets the start date, so I will work from their record rather than asking you to repeat it. Tell me anything role-specific they will need beyond the standard account, email and device.',
    simple:'I can do this.\n\nHR gives us the start date. I will use that.\n\nPlease tell me if they need anything special for their job. They will already get an account, email, and a computer.',
    steps:'1. I work from the HR record for the start date\n2. Standard account, email and device are automatic\n3. Tell me anything role-specific',
    full:'I can set this up. The start date comes from the HR record rather than from the ticket, so I will work to that — if the date in HR is wrong, that needs correcting at source or the account will be created to the wrong schedule.\n\nThe standard set — account, email, and a device — is covered without you asking. What is worth telling me is anything specific to the role: a system their team uses, a shared mailbox they need to be in, a licence beyond the standard one. Those are the things that otherwise surface on their first morning.',
    formal:'I will work from the HR record for the start date. The standard account, email and device are covered. Please tell me anything role-specific, as those are what otherwise surface on day one.',
    tech:'Joiner provisioning runs off the HR feed for the start date. Standard account, licence and device are covered. Send role-specific group membership, shared mailbox access, or non-standard licence requirements separately.'
  },
  close:{
    plain:'All set for Monday. If anything is missing on their first day, tell me what they were trying to do and I will sort it quickly.',
    simple:'Everything is ready for Monday.\n\nIf something is missing, tell me. I will fix it fast.',
    steps:'Ready. Report anything missing on day one.',
    full:'Everything is provisioned and ready for their start date. Their account, email and device are in place, along with the role-specific access you flagged.\n\nIf something is missing on the first morning, tell me what they were trying to do rather than which permission you think is needed — it is faster to work back from the task, and first-day gaps are usually one group membership rather than anything structural.',
    formal:'Provisioned and ready for the start date, including the role-specific items you flagged. Report any first-day gaps by task and I will resolve them quickly.',
    tech:'Provisioned to the HR start date, role groups applied. Report gaps by task for fastest resolution.'
  },
  do:{
    1:['Raise it and pass to Tier 2. Capture the start date and the role.',
       'Do not take a start date from the requester as final — HR sets it.'],
    2:['Work the Joiner procedure. HR states the date, not IT and not the manager.',
       'Chase role-specific access early — it is what fails on day one.'],
    3:['Only for non-standard licence or system provisioning.'],
    4:['If it needs a purchase or an exception.']
  }
},
{
  id:'leaver', q:'Someone is leaving or has left',
  cat:'Joiners & leavers', kcat:'Account Services', sop:'ACC-01', tier:2, pri:'P2', safe:'yours',
  links:[],
  ask:[],
  say:{
    plain:'I will handle it. Their access closes on the date HR holds, and the mailbox is kept rather than deleted — so if you need something from it later, that is possible through the proper route. Tell me if anyone needs access to their email or files to cover the work.',
    simple:'I will do this.\n\nTheir access stops on the date HR has.\n\nWe keep their email. We do not delete it.\n\nDo you need someone to read their email or files? Please tell me who.',
    steps:'1. Access closes on the HR date\n2. Mailbox is retained, not deleted\n3. Tell me who needs cover access to email or files',
    full:'I will handle this. Two things worth knowing.\n\nFirst, the closing date comes from the HR record. If the date there is wrong, the access will close to the wrong schedule, so that is the place to correct it.\n\nSecond, the mailbox is retained rather than deleted — for at least two years. That matters practically: if you realise in three months that something you need is in their email, it still exists and can be retrieved through the proper request. It also means nobody needs to forward things out to themselves before the person leaves.\n\nIf someone needs to cover the work, tell me who and I will arrange access to the mailbox or files properly, with a record of it, rather than sharing the departing person’s password — which would leave you unable to prove who did what afterwards.',
    formal:'I will action this to the date HR holds. The mailbox is retained for at least two years, so later retrieval remains possible through the proper route. Tell me who requires cover access and I will arrange it with a record, rather than credentials being shared.',
    tech:'Leaver procedure, closing to the HR date. Mailbox retained on a two-year floor. Delegate cover access properly rather than sharing credentials — the audit trail matters here.'
  },
  close:{
    plain:'Done. Their access is closed and the mailbox is retained, so anything needed later can still be retrieved properly.',
    simple:'Finished. Their access is closed.\n\nTheir email is saved. If you need something from it later, ask us.',
    steps:'Closed. Mailbox retained — ask us if you need something from it later.',
    full:'Their access is closed as of the HR date, and the mailbox is retained rather than deleted. If something is needed from it later, that request can be made and fulfilled through the proper route, with a record of who asked and what was provided.\n\nIf you arranged cover access, that is in place and recorded. When the cover is no longer needed, tell me and I will remove it — leaving it in place is the most common way access quietly accumulates beyond what anyone intended.',
    formal:'Access closed to the HR date; mailbox retained. Cover access, where arranged, is recorded — please tell me when it is no longer required so it can be removed.',
    tech:'Access revoked to the HR date, mailbox retained on the retention floor, delegation recorded. Notify when cover access can be removed.'
  },
  do:{
    1:['Raise it and pass to Tier 2. Note the leaving date and whether anyone needs cover access.',
       'Never share a departing person’s password to give someone cover. Ask Tier 2 to delegate it properly.'],
    2:['Work the Leaver procedure. HR sets the date. Keep the mailbox at least two years.',
       'Delegate cover access explicitly; do not share credentials.'],
    3:['Only for shared resource reassignment or licence reclaim.'],
    4:['Retention or legal-hold exceptions.']
  }
},
{
  id:'sharedmbx', q:'I need a shared mailbox, or access to one',
  cat:'Email & calendar', kcat:'Email permissions', sop:'M365-03', tier:3, pri:'P3', safe:'yours',
  links:['outlook'],
  ask:[{ id:'which', field:'Category', label:'Which is it?',
    opts:[{ v:'A new shared mailbox', then:'yours' },
          { v:'Access to one that exists', then:'yours' }] }],
  say:{
    plain:'I can arrange that. A shared mailbox needs an owner named — someone accountable for who is in it — and for access to an existing one, the current owner approves. Tell me the name and I will take it from there.',
    simple:'I can do this.\n\nEvery shared mailbox needs one person who is responsible for it.\n\nFor a mailbox that already exists, that person must say yes.\n\nPlease tell me the name of the mailbox.',
    steps:'1. Name the mailbox\n2. Name the owner (new) or get owner approval (existing)\n3. I set up access\n4. It appears in Outlook automatically',
    full:'I can arrange this. One requirement worth explaining: every shared mailbox has a named owner. That is the person who decides who is in it and who is asked when access is reviewed. Without one, access accumulates over years and nobody can say who should still have it — which is exactly the situation reviews exist to prevent.\n\nFor a new mailbox, tell me who the owner is. For access to an existing one, the current owner approves the request; I will ask them rather than asking you to chase it.\n\nOnce granted, the mailbox appears in Outlook on its own — you do not need to add it manually. On a phone it may need the app restarted.',
    formal:'I can arrange this. A shared mailbox requires a named owner, who also approves access requests to an existing one — I will seek that approval directly. Once granted it appears in Outlook automatically.',
    tech:'Shared mailbox provisioning needs a named owner for the access review trail. Existing mailbox: owner approval required. Auto-mapping handles the Outlook side; mobile may need an app restart.'
  },
  close:{
    plain:'Access is in place. It will appear in Outlook on its own — restart the app on your phone if it has not shown up there.',
    simple:'You have access now.\n\nIt will appear in Outlook by itself.\n\nOn your phone, close the app and open it again.',
    steps:'Granted. Appears in Outlook automatically; restart the phone app if not.',
    full:'Access is granted and recorded against the mailbox owner, so it will show correctly when access is next reviewed. The mailbox appears in Outlook on the desktop and web automatically; on a phone, closing and reopening the app is usually needed.\n\nWhen you no longer need it, tell us. Shared mailbox access is the most common place where permissions quietly outlive the reason they were granted.',
    formal:'Granted and recorded against the owner. It appears in Outlook automatically; mobile may require an app restart. Please tell us when access is no longer required.',
    tech:'Access granted, recorded against the owner for review. Auto-mapping applies; mobile needs an app restart. Notify on revocation.'
  },
  do:{
    1:['Raise it and pass to Tier 2. Capture the mailbox name and who the owner is.',
       'A request with no named owner will come straight back — ask while you have them.'],
    2:['Named owner is mandatory. Existing mailbox: get the owner’s approval, do not assume it.',
       'Record the grant against the owner so the access review works later.'],
    3:['Only for distribution-list or connector-side work.'],
    4:['Licence implications only.']
  }
},
{
  id:'device', q:'My computer is broken, won’t start, or is too slow to work on',
  cat:'Device & hardware', kcat:'HARDWARE troubleshooting', sop:'DEV-05', tier:1, pri:'P3', safe:'yours',
  links:[], ask:[{ id:'work', field:'Confirmed cause', label:'Can they still work?',
    opts:[
      { v:'No — it will not start, or it is unusable', then:'yours', kcat:'HARDWARE troubleshooting' },
      { v:'Yes, but it is slow or one part is failing', then:'yours', kcat:'HARDWARE troubleshooting' },
      { v:'It was dropped, spilled on, or physically damaged', then:'yours', kcat:'Hardware swap', tier:2 },
      { v:'It is asking for a BitLocker recovery key', then:'yours', kcat:'Hardware troubleshooting', tier:2 }
    ] }],
  say:{
    plain:'Sorry, that is a rotten way to start the day. Your files are safe in OneDrive, so nothing is lost. I am going to get you working again first, on a loaner if I need to, and then we will sort the machine itself.',
    simple:'I am sorry this happened.\n\nYour files are safe. They are saved online.\n\nI will help you work again today. You may get a different laptop for now.',
    steps:'1. Your files are safe in OneDrive\n2. We get you working first, on a loaner if needed\n3. Then we fix or replace your machine\n4. You get it back with everything signed in',
    full:'Thanks for telling us straight away. First, the important part: your files live in OneDrive, not on the laptop, so a broken machine does not mean lost work.\n\nThe order we work in is you first, the machine second. If yours cannot be fixed quickly, I will set you up on a loaner that has already been checked: it starts, Teams signs in, the camera, microphone and speakers work, and it has a charger. Then we look at your own machine properly without you waiting on it.\n\nOne thing to know about a loaner: anything you save only to its own disk is wiped when it comes back. Save to OneDrive and you lose nothing.',
    formal:'Your files are held in OneDrive and are unaffected. I will restore your ability to work first, on a pre-checked loaner if needed, and then repair or replace the device.',
    tech:'Triage now; if it is not a quick fix, a pre-checked loaner goes out (DEV-05 §3) and the device goes to Tier 2. Data is in OneDrive; confirm nothing is local-only before anything is wiped.'
  },
  close:{
    plain:'You are back up and running. If anything feels off in the next few days, reply here and we will pick it straight back up.',
    simple:'Your computer works now.\n\nIf there is a problem, reply to this message.',
    steps:'Done. Reply here if anything is not right.',
    full:'You are back up and running. If you were on a loaner, please bring it back with its charger by the return date we agreed, and tell us anything that did not work on it: people rarely mention faults on a machine they are handing back, and that is how the next person gets a better one. Anything saved only to the loaner’s own disk is wiped when it comes back.',
    formal:'Resolved. Please return any loaner and charger by the agreed date. Reply here if the issue recurs.',
    tech:'Resolved. Loaner returned or due back on the logged date; return-to-service check runs before it re-enters the pool.'
  },
  do:{
    1:['Ask whether they can work at all. That decides the priority, not how broken the machine sounds.',
       'Tell them their files are in OneDrive before anything else. It takes the panic out of the call.',
       'If it cannot be fixed in a few minutes, issue a loaner: run the pre-issue check, record who has it, the asset tag and a return date. “Until mine is fixed” is not a date.',
       'Confirm they can sign in to the loaner before they leave the desk. This one step prevents most “the loaner doesn’t work” calls.',
       'Damage, a spill, or a BitLocker recovery screen goes to Tier 2. Do not wipe anything.'],
    2:['Get them working first; the device second. Loaner per DEV-05 if the repair is not quick.',
       'BitLocker recovery: confirm identity, then the key from Entra (DEV-03). Before any wipe, confirm the key is escrowed.',
       'Swap or repair, update inventory against the asset tag, clear the primary user if the device leaves service.'],
    3:['Only involved if a pattern points at the build, the baseline or a driver push.'],
    4:['Only involved if it needs a purchase or an early replacement outside the refresh cycle.']
  }
},
{
  id:'software', q:'I need software installed',
  cat:'Software, print & rooms', kcat:'Software deployment and management', sop:'DEV-11', tier:2, pri:'P3', safe:'yours',
  links:['kb'], ask:[{ id:'kind', field:'Confirmed cause', label:'Which is it?',
    opts:[
      { v:'It is already in the approved software catalogue', then:'self', kcat:'SELF-SERVICE resolved', tier:1 },
      { v:'New software we do not have yet', then:'yours', kcat:'Software deployment and management', tier:2 },
      { v:'It asks for an admin password to install or run', then:'yours', kcat:'Software deployment and management', tier:2 },
      { v:'A browser extension', then:'yours', kcat:'Software deployment and management', tier:2 }
    ] }],
  say:{
    plain:'Happy to help. First thing I will check is whether we already have it, or something that does the same job — that is the fastest yes. If it is new, I will send you a short form so the right people can approve it.',
    simple:'I can help.\n\nFirst, I will check if we already have this app.\n\nIf we do not, I will send you a short form.',
    steps:'1. I check whether we already have it\n2. If we do, you install it yourself from the catalogue\n3. If not, you fill in a short request form\n4. We tell you whether it is approved and when it arrives',
    full:'Thanks for asking before installing it — that genuinely helps. Here is how it works.\n\nIf the app is already approved, you can install it yourself from the software catalogue (Company Portal on most work computers), with no waiting.\n\nIf it is new, I will send you a short form. The questions that matter most are what it is for, who will use it, whether it touches personal or payroll data, and where that data goes. Those decide who needs to approve it. Free software still goes through this, because free usually means the data is the price.\n\nOne thing we will not do is give your account admin rights to get it installed. We package the app instead, so it installs safely for you and for everyone after you.',
    formal:'If it is already approved you can install it from the software catalogue directly. If it is new, a short request form routes it to the right approver; I will send it now.',
    tech:'Catalogue first (Company Portal). New product: DEV-11 intake form, security review if it touches user data or signs in with org identity (ACC-16). No standing local admin; package it (DEV-12).'
  },
  close:{
    plain:'It is installed and ready. If it asks you to sign in, use your work account.',
    simple:'The app is ready.\n\nSign in with your work email if it asks.',
    steps:'Installed. Use your work account if it asks you to sign in.',
    full:'It is installed and ready to use. Updates will arrive the same way it did, so you do not need to download new versions yourself. If you stop needing it, tell us — a seat nobody uses is still a seat somebody pays for.',
    formal:'Installed and available. Updates are managed centrally. Please let us know if the licence is no longer needed.',
    tech:'Deployed via the managed channel and recorded in the licence register. Updates follow the managed channel; no local admin granted.'
  },
  do:{
    1:['Check the approved catalogue first. Most requests end here, and the person can install it themselves.',
       'If it is new, send the request form and log it. You do not decide whether it is approved.',
       'Never type an admin password for someone so an install can finish. That is the request, not the fix: pass it to Tier 2.'],
    2:['Check §2 first: do we already have it, or something that does the job? Then the mandatory fields: what, why, who, data, where, cost, when, rights, sign-in.',
       'Touches user, payroll or HR data, or sends data to a vendor cloud → security review and Tier 4, whatever the cost, including free.',
       'Needs admin to install: package it and deploy through the managed channel. Needs admin to run: that is a DEV-12 exception, Tier 4, with an expiry.',
       'Record it in the licence register when it is deployed.'],
    3:['Security and compatibility assessment: provenance, network reach, sign-in method, leaver removal, OAuth consent, patch channel.'],
    4:['Approves cost, anything touching sensitive data, and any admin-rights exception — always with an expiry.']
  }
},
{
  id:'print', q:'The printer isn’t working',
  cat:'Software, print & rooms', kcat:'PRINTER issue', sop:'DEV-17', tier:1, pri:'P3', safe:'self',
  links:['kb'], ask:[{ id:'scope', field:'Confirmed cause', label:'Just them, or everyone?',
    opts:[
      { v:'Just this person', then:'self', kcat:'PRINTER issue' },
      { v:'Nobody can print to it', then:'yours', kcat:'Printer troubleshooting', tier:2 },
      { v:'They need a printer added', then:'self', kcat:'PRINTER issue' },
      { v:'The copier needs a vendor service call', then:'yours', kcat:'PRINTER issue' }
    ] }],
  say:{
    plain:'Let’s get it printing. First, have a look at the printer’s own screen: nine times out of ten it is telling you what is wrong, like a paper jam or an open tray. If that is clear, check the printer name in the print window matches the sticker on the machine.',
    simple:'Let’s fix it.\n\n1. Look at the small screen on the printer. Does it show a problem?\n2. Check the printer name when you press Print.\n\nTell me what you see.',
    steps:'1. Read the printer’s screen and fix what it says\n2. Check you picked the right printer\n3. Clear your print queue, print once\n4. Restart the printer, then your computer\n5. Still stuck? Reply and we take over',
    full:'Printers fail in a small number of predictable ways, so we will go through them in order.\n\nFirst, look at the printer itself. Its little screen is usually telling you what is wrong: paper, toner, a jam, a door that is not quite shut. Second, check that you are printing to the printer you are standing next to; a vanished job very often printed perfectly on another floor. Third, if it is a secure-release printer, your job is waiting until you tap your card or enter your PIN.\n\nIf none of those, open your print queue, clear anything stuck, and print once — just once. Printing four more times while one is stuck is how six copies appear an hour later. Then restart the printer, and then your computer. If it is still not working, tell me whether anyone else can print, and I will take it from there.',
    formal:'Please check the printer’s display for an error and confirm the selected printer matches the label on the device. If it still fails, let me know whether colleagues can print and I will take it from there.',
    tech:'Run the ladder: device display, correct queue, secure release, stuck job, power cycle, spooler (restart), scope check, test page, remove/re-add the queue. Nobody can print → Tier 2 queue/driver.'
  },
  close:{
    plain:'Printing again. If it stops, reply here rather than printing the same thing over and over — we will pick it up.',
    simple:'The printer works now.\n\nIf it stops, reply to this message.',
    steps:'Fixed. Reply here if it stops again.',
    full:'You are printing again. If it happens again, reply to this rather than resending the job — repeated jobs stack up behind a stuck one. And if it is ever a whole floor that cannot print, tell us straight away; that is the printer, and we would rather hear it from the first person than the tenth.',
    formal:'Resolved. If it recurs, please reply here rather than resubmitting the job.',
    tech:'Resolved and test page confirmed. If recurring for one user, re-add the queue; if fleet-wide, it is a queue or driver issue for Tier 2.'
  },
  do:{
    1:['Walk them through the ladder in order. The printer’s own screen is the answer more often than everything else put together.',
       'Ask whether anyone else can print. Everyone → it is the printer, and Tier 2 wants to know. Only them → their computer or their queue.',
       'Adding a printer: confirm which one from the printer register, add it, and print a test page before you close. Added but never printed is not closed.',
       'Copier fault: log it with the vendor yourself and record the vendor reference on the ticket. Departments calling the vendor directly lose the fault history.'],
    2:['Fleet-wide or queue-wide: check the print server or cloud print queue, the driver package, and the assignment group.',
       'Record any deployment gap — assignment groups get corrected in batches built from these records.'],
    3:['Only involved for the print architecture itself.'],
    4:['Only involved for exceptions, a purchase, or approving a copier disposal.']
  }
},
{
  id:'roomav', q:'The meeting-room AV isn’t working',
  cat:'Software, print & rooms', kcat:'MEETING ROOM troubleshooting', sop:'DEV-18', tier:1, pri:'P2', safe:'yours',
  links:[], ask:[{ id:'live', field:'Confirmed cause', label:'Is a meeting happening right now?',
    opts:[
      { v:'Yes — people are in the room waiting', then:'yours', kcat:'Meeting room EMERGENCY', tier:2 },
      { v:'No — it is for a meeting later', then:'yours', kcat:'MEETING ROOM troubleshooting' },
      { v:'It keeps failing in the same room', then:'yours', kcat:'Meeting room vendor coordination', tier:2 },
      { v:'The room phone or Teams Room console', then:'yours', kcat:'Teams Phone deployment', tier:2 }
    ] }],
  say:{
    plain:'Let’s get you up. Press the INPUT or SOURCE button on the screen or remote and keep pressing until you see your own screen — that is the fix about half the time. If not, unplug the cable at both ends and push it back in firmly.',
    simple:'Let’s fix it.\n\n1. Press the INPUT or SOURCE button. Keep pressing until you see your screen.\n2. Unplug the cable. Plug it in again firmly.\n\nTell me what happens.',
    steps:'1. Press INPUT / SOURCE until you see your screen\n2. Reseat the cable, or use the spare\n3. Touch the console to wake the room\n4. Check volume: app, computer, room\n5. In a meeting, pick the room camera and mic\n6. Still stuck? Present from your laptop and call us',
    full:'Room problems are nearly always one of a few simple things, so we will go fast.\n\nPress the INPUT or SOURCE button until you see your own screen. Then reseat the cable at both ends, or use the spare if there is one. Touch the console or move the mouse, because a room that looks dead is usually asleep. If there is no sound, check three places in order: the app, your computer, then the room’s own volume. It is almost always muted rather than low.\n\nIf you are in a Teams or Zoom meeting, open the audio and video settings and make sure the room camera and microphone are selected, not your laptop’s.\n\nIf none of that works and people are waiting, carry on from your laptop screen and let us fix the room afterwards. That is the right call, not a failure.',
    formal:'Please press INPUT or SOURCE until your screen appears, then reseat the cable. If it is not resolved within a few minutes, continue from your laptop and we will attend.',
    tech:'Run the recovery ladder: input, cable, wake, audio (app/OS/room), device selection in the meeting client, console restart only if there is time. Live session down → Meeting room EMERGENCY, Tier 2.'
  },
  close:{
    plain:'The room is working again. If it lets you down again, tell us the room number — repeat faults in the same room go on our list to replace.',
    simple:'The room works now.\n\nIf it breaks again, tell us the room number.',
    steps:'Fixed. If it happens again, send us the room number.',
    full:'The room is working again. If you have something important in a room, run the five-minute check beforehand: your own laptop, your own cable, the real file, sound from the back of the room, and a thirty-second test call if it is hybrid. And if a room fails you twice, tell us the room number — rooms that fail repeatedly go on a list with costs attached, which is how they get replaced.',
    formal:'Resolved. Please report the room number if it recurs; repeat faults are tracked for replacement.',
    tech:'Resolved. Logged against the room in the fault register; repeat faults escalate to Tier 4 with a cost.'
  },
  do:{
    1:['Ask first whether people are waiting. A live meeting that cannot proceed is P1 and goes to Tier 2 now.',
       'Talk them through the ladder: input, cable, wake, audio, device selection. Input and cable fix most of it in under a minute.',
       'If it is not fixed in three minutes, tell them to carry on from the laptop and fix the room afterwards. Say it plainly — it is the right call.',
       'Never call the vendor yourself. Log the room number and pass it up.'],
    2:['Live session down: attend, or talk them to the fallback and attend afterwards.',
       'Room phone or console: check what it is signed in as first. It should be the room’s resource account, not a person’s.',
       'Log the fault against the room in the register. Twice in the same room → vendor coordination.'],
    3:['Teams Rooms tenant configuration only.'],
    4:['Room investment and replacement decisions, from the fault register list with costs.']
  }
}
];

/* ── Everything not in a job pack still gets a working card, built from the
   SOP itself plus a register-appropriate generic script. Honest about what it
   does not know rather than inventing a procedure.                        */
export const GENERIC = {
  say:{
    plain:'Thanks — I have got your request and it is logged. I am looking at it now and will come back to you with either a fix or a clear next step.',
    simple:'Thank you. I have your request.\n\nI am looking at it now.\n\nI will send you a message soon.',
    steps:'1. Logged\n2. Being looked at now\n3. You will hear back with a fix or a next step',
    full:'Thanks — your request is logged and I am looking at it now.\n\nRather than guess at a timeline, I will come back to you with either the fix or a specific next step, including who is dealing with it if it needs to move to a colleague. If it turns out to need approval or a purchase, I will tell you that plainly rather than leaving it quiet.',
    formal:'Your request is logged and I am reviewing it now. I will come back with a fix or a specific next step, including ownership if it needs to move.',
    tech:'Logged and triaged. I will come back with the fix or the handoff, including what it is blocked on if it is blocked.'
  },
  close:{
    plain:'All done. If it comes back, reply to this and it reopens with the history attached — no need to start again.',
    simple:'This is finished.\n\nIf the problem returns, reply to this message. Do not start a new request.',
    steps:'Closed. Reply here if it returns.',
    full:'This is resolved and closed. If the same problem returns, reply to this rather than raising a new request — replying keeps the history together, which means whoever picks it up can see what was already tried instead of starting from the beginning.',
    formal:'Resolved and closed. Please reply to this rather than raising a new request if it recurs, so the history stays attached.',
    tech:'Resolved and closed. Reply to reopen with history intact rather than opening a new ticket.'
  }
};

/* ── Links worth offering when there is no job pack, derived from the
   category rather than left empty. Conservative: only where the mapping is
   unambiguous.                                                            */
export const LINKS_BY_CAT = {
  'Access & sign-in':['sspr', 'mfa', 'myapps'],
  'Joiners & leavers':['myapps'],
  'Email & calendar':['outlook'],
  'Files & sharing':['kb'],
  'Teams & meetings':['outlook'],
  'Privileged & service accounts':['myapps']
};

/* Categories where an account is being acted on, so identity has to be
   proven first. Everything else does not need that field. */
export const ACCOUNT_CATS = ['Access & sign-in', 'Joiners & leavers',
  'Privileged & service accounts', 'Identity feed'];

/* ── What to do when no job pack exists. Pitched by whether the procedure
   sits above the reader's tier — a Front Door technician facing a Tier 3 runbook
   needs "hand it up", not four paragraphs of it.                          */
export const GENERIC_DO = {
  above:[
    'Raise the ticket if there is not one, and write what they said in their own words — not your interpretation of it.',
    'Ask what they were trying to do when it stopped working. It is the one question that saves the next person a call back.',
    'Hand it up. This one sits above your tier, so reading the full procedure is optional rather than expected.',
    'Tell the user plainly that you are passing it to a colleague and that they do not need to do anything.'
  ],
  own:[
    'The steps below come from the procedure itself, word for word.',
    'Work them in order. Where the procedure asks you to decide something, open the full version — this summary skips the branches.'
  ]
};

/* ── The ticket. Any ticketing system: the app builds a block to paste in,
   using the same field names and category paths everywhere. Priority labels
   follow the common Critical / High / Medium / Low scale.                  */
export const TICKET = {
  priority:{ P1:'Critical', P2:'High', P3:'Medium', P4:'Low' },
  openStatus:'Open',
  workingStatus:'In progress',
  closedStatus:'Closed',
  source:'Opened with the Known Good Process Tree'
};


/* ── The shared category scheme. Written "Tier N::category" so the tier is the
   parent; Tier 3 nests its team. Set these up as categories in whatever
   ticketing system you use. Handling notes say what the tier needs to work them. */
export const MARKERS = {
  open:'«OPEN TICKET»', sts:'«T1 ESCALATION»', expert:'[EXPERT NEEDED]', escalation:'[ESCALATION REQUEST]'
};
export const SCHEME = [
  { tier:1, name:'ACCESS issues', what:'can’t access link, website, app', links:['mfa','sspr','kb','myapps'],
    needs:'Triage for Account Services. Basic troubleshooting for access. MFA and SSO both need a technical guide and links. Point people to the help center, with links for MFA setup and self-service password reset.' },
  { tier:1, name:'MEETING issues', what:'Teams, Zoom', links:['kb'],
    needs:'Basic troubleshooting, with guides and support references. MFA. The internal knowledge base, with links pinned in the team’s chat channel.' },
  { tier:1, name:'PASSWORD reset', what:'', links:['sspr','kb'],
    needs:'The internal knowledge base, with links pinned in the team’s chat channel. Basic troubleshooting, with guides and support references.' },
  { tier:1, name:'PRINTER issue', what:'', links:['kb'],
    needs:'Awareness of outages through a team chat channel carrying posts and updates from the network team and Tier 3 and above. The internal knowledge base, links pinned.' },
  { tier:1, name:'GENERAL guidance', what:'', links:['kb'],
    needs:'Awareness of outages through the same channel. The internal knowledge base, links pinned.' },
  { tier:1, name:'MEETING ROOM troubleshooting', what:'', links:[],
    needs:'Awareness of outages through the team channel. Basic troubleshooting, with guides and support references.',
    rule:'If the room is unusable, it becomes Meeting room EMERGENCY in the Tier 2 queue — a rushed ticket. Tier 1 never calls the vendor.' },
  { tier:1, name:'HARDWARE troubleshooting', what:'', links:[],
    needs:'Awareness of Intune issues through the team channel. Basic troubleshooting for personal devices and BYOD, and for organization devices that are Intune-managed or domain-joined.' },
  { tier:1, name:'WIFI troubleshooting', what:'', links:[],
    needs:'Awareness of network outages via the Teams channel. Basic troubleshooting; guides and support references needed.' },
  { tier:1, name:'SELF-SERVICE resolved', what:'closed by a self-service guide', links:['kb'],
    needs:'The person finished it themselves with a self-service guide, with or without a nudge. Count these: each one is a ticket the guides absorbed.' },
  { tier:1, name:'Storage room', what:'', links:[],
    needs:'Requests for loans of cables, chargers and accessories. Requests from management to organize. Requests from management to collect recycling for pickup.' },
  { tier:2, name:'Account Services', what:'', links:[],
    needs:'Permissions to Entra. Password reset, MFA setup, MFA troubleshooting, account lockout. How to confirm whether a user should be escalated due to prior history.' },
  { tier:2, name:'Meeting room EMERGENCY', what:'', links:[], needs:'Rushed ticket.', pri:'P1' },
  { tier:2, name:'Meeting room vendor coordination', what:'', links:[], needs:'For when Tier 1 reports a serious issue after assessing.' },
  { tier:2, name:'Glitch / bug report', what:'', links:[],
    needs:'Report the bug through a bug report form that posts automatically to the IT team’s chat channel.' },
  { tier:2, name:'Hardware swap', what:'', links:[], needs:'Inventory and ticket update, against a maintained master inventory.' },
  { tier:2, name:'Hardware troubleshooting', what:'', links:[],
    needs:'Awareness of Intune issues through the network team and Tier 3 channel. Basic troubleshooting for personal devices and BYOD, and for Intune-managed or domain-joined organization devices. Guides and support references.' },
  { tier:2, name:'Malware cleanup', what:'', links:[],
    needs:'Guides for remediation. Endpoint security alerts route to a dedicated mailbox or queue that opens the ticket automatically, creates an urgent remediation task for Tier 2, and re-alerts Tier 2 and above until the task is done.',
    rule:'If it is an incident rather than a single infected endpoint, it becomes a Tier 4 Security incident.' },
  { tier:2, name:'Mobile device management', what:'', links:[], needs:'MDM permissions (Intune, Jamf or equivalent). Guides for troubleshooting and management.' },
  { tier:2, name:'Printer troubleshooting', what:'', links:[],
    needs:'Guides for the print management system and printer troubleshooting, saved to the internal knowledge base. Vendor or MSP contact details on a contact sheet in the internal knowledge base.' },
  { tier:2, name:'Network port troubleshooting', what:'', links:[],
    needs:'How to use a cable tester to relay information to Tier 3, and how to request Tier 3 support on the team’s task board.' },
  { tier:2, name:'Software deployment and management', what:'', links:[],
    needs:'Intune (and any legacy endpoint tool) for software management, with guides on using each effectively.' },
  { tier:2, name:'Teams Phone deployment', what:'', links:[],
    needs:'Phone provisioning; deploying and replacing physical phones; provisioning phone numbers; assigning users to call queue groups. Documentation of the phone system. Permissions to the phone provider’s portal and the Teams admin center. Guides on provisioning a user for calling and SMS, confirming the right licence, and what to do when they do not have it, which is to escalate to Tier 3.' },
  ...['LMS','HR / records system','Records system development','Records system reports','Data management','Document management','Emergency notification','Reporting / BI']
    .map(n => ({ tier:3, team:'Application team', name:n, what:'', links:[], needs:'' })),
  ...['Audit / review','AVS / VMs','Microsoft 365 admin task','Email permissions','Ticketing system admin','Network infrastructure','Security incident / compliance','SSO issue','Server decommission','System maintenance','System migration','System upgrade']
    .map(n => ({ tier:3, team:'Infrastructure team', name:n, what:'', links:[], needs:'' })),
  ...['Audit & reports','Management needed','Purchase request','Phone number / SMS request','Organization-wide communication needed','Security incident']
    .map(n => ({ tier:4, name:n, what:'', links:[], needs:'', pri:n === 'Security incident' ? 'P1' : undefined }))
];
export const schemeByName = n => SCHEME.find(c => c.name === n) || null;
/* User decisions: tier as parent; Tier 3 nests its team ("Tier 3::Application::the LMS");
   all four entry markers sit under Tier 1. */
export const catPath = name => {
  if (Object.values(MARKERS).indexOf(name) >= 0) return 'Tier 1::' + name;
  const c = schemeByName(name); if (!c) return name;
  return 'Tier ' + c.tier + '::' + (c.team ? c.team.replace(/ team$/, '') + '::' : '') + name;
};

/* Response times — GOV-06 targets. Cushion, not a promise: set your own. */
export const TIMES = {
  P1:{ label:'Critical', gov06:'15 minutes (1 hour out of hours, outage and security only)', kb:'15 min first response · 4 h resolution' },
  P2:{ label:'High',     gov06:'4 working hours', kb:'1 h first response · 8 h resolution' },
  P3:{ label:'Medium',   gov06:'1 working day',   kb:'4 h first response · 2 business days' },
  P4:{ label:'Low',      gov06:'3 working days',  kb:'1 business day · 5 business days' }
};
export const CRISIS = [
  ['Life-threatening emergency', '911'],
  ['Mental health crisis', 'Call or text 988'],
  ['Site security or building management', 'Your local number — put it on your desk card']
];
/* The tier pages in your internal knowledge base. Shown as references. */
export const KB_PAGES = {
  1:'IT Tier 1 — Front Door technicians', 2:'IT Tier 2 — Advanced Technical Services',
  3:'IT Tier 3 — Expert Services', 4:'IT Tier 4 — IT Management'
};
export const EXEC_DRAFT = 'C-suite and executive-level employees (VIPs), department leads, system administrators, etc.';

export const jobById = id => JOBS.find(j => j.id === id) || null;

/* ── When it is not IT's. One script for every redirect: name the owner in
   plain words, point at the staff directory rather than an address from
   memory, and close it as redirected. An up-to-date directory is what makes
   this fast, so the card leans on it.                                      */
export const REDIRECT = {
  say:{
    plain:'Thanks for asking us. This one is handled by {desk}, not IT, so they are the people who can actually sort it. You can find how to reach them in the staff directory. If something technical turns up along the way, come straight back to us.',
    simple:'Thank you for asking.\n\nThis is not an IT question. {desk} can help you.\n\nYou can find them in the staff directory.',
    steps:'1. This belongs to {desk}, not IT\n2. Find them in the staff directory\n3. Come back to us if something technical turns up',
    full:'Thanks for getting in touch. This request belongs to {desk} rather than IT. We could try to help, but they own the process and the records behind it, so going to them directly will be quicker and the answer will be right.\n\nThe staff directory has their current contact details. If anything technical comes up along the way, such as a form that will not load or an account that will not sign in, come straight back to us and we will pick that part up.',
    formal:'This request falls to {desk} rather than IT. Their current contact details are in the staff directory. Please come back to us for any technical issue that arises.',
    tech:'Not an IT request: owner is {desk}. Route via the staff directory. Logged as redirected.'
  },
  close:{
    plain:'I have closed this on our side as passed to {desk}. If anything technical comes up, reply here and we will pick it back up.',
    simple:'We have closed this.\n\n{desk} will help you.\n\nReply here if you have a computer problem.',
    steps:'Closed as redirected to {desk}. Reply here for anything technical.',
    full:'I have closed this on our side as redirected to {desk}, so our records show where it went. If anything technical comes up while you sort it out with them, reply to this and it reopens with the history attached.',
    formal:'Closed on our side as redirected to {desk}. Reply here should any technical issue arise.',
    tech:'Closed: redirected to {desk}. Reopen via reply for technical follow-up.'
  },
  do:[
    'Check it really is not IT. If anything technical is involved, such as sign-in, a device or an app, keep that part and redirect the rest.',
    'Look the owner up in the staff directory rather than naming a person or an address from memory. If the directory is wrong, tell whoever maintains it.',
    'Tell the person, in plain words, who handles it and how to reach them.',
    'Log it as redirected, with the department you sent it to. Redirecting correctly counts as resolving it.',
    'Seeing the same kind of request again and again? Flag it: that department may need a clearer front door of its own.'
  ]
};
