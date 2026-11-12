// model-input.js — phish-tiny's input format: the one text the model reads, built from an email's facts.
//
// THIS IS PART OF THE MODEL. Training (make-dataset.js) builds every training email with it, and every
// program that runs the model must build exactly the same text, or the model reads something it was
// never trained on. The consumers keep their own copy of these lines (the S.P.R.U.C.E+ extension's
// ai.js and shared.js; S.P.R.U.C.E Mail Protection Service's vendor/spruce/), and their tests compare it with
// model/reference/input-format.jsonl, which this file produces (node training/check.js --write).
// Change the format here first, retrain, regenerate the reference, then sync the consumers.
// Its home is TinyPhishLLM_Private_Training (private), training/model-input.js; training/publish.js copies it,
// unchanged, to TinyPhishLLM (public) as tools/model-input.js, where tools/check.js uses it.
//
// Copied unchanged from the S.P.R.U.C.E+ extension (branch llm_testing, commit 9292388): ai.js, the input
// section, and shared.js, isSharedMailbox. Plain JavaScript: loaded with vm (as make-dataset.js does) or
// with require().

// From shared.js: role mailboxes (info@, billing@, noreply@…), marked "(shared mailbox)" in the input.
const SHARED_MAILBOX_RE = /^(contact|contactus|info|information|hello|hi|hey|support|help|helpdesk|service|services|customerservice|customercare|care|sales|marketing|news|newsletter|newsletters|updates?|notifications?|notify|alerts?|noreply|no-reply|donotreply|do-not-reply|mail|mailer|email|team|office|admin|billing|accounts?|orders?|shop|store|feedback|community|events?|press|media|jobs|careers|recruiting|reply|members?|membership|webmaster|enquiries|inquiries|general|welcome|offers|deals|promotions?|digest|reminders?|receipts?|invoices?|security|account-security|service-desk)([._+-].*)?$/i;
function isSharedMailbox(address) {
    const local = String(address || '').toLowerCase().split('@')[0];
    return !!local && SHARED_MAILBOX_RE.test(local);
}

// ---------------------------------------------------------------------------------------------------
// The model's input: one text built from the email's facts. tools/ai/make-dataset.js builds its
// training emails with this same function, so training and use always see the same format.
// facts: { subject, senderName, senderAddress, auth: { dmarc } | null,
//          links: [{ text, host, destHost, finding }], bodyText,
//          org: 'inside' | 'outside' | undefined (the user's own organization, when the account has one),
//          recipient: the reader's own mailbox name (the part before @), replaced by "your name" wherever
//                     it appears, so the model sees the trick ("READER! Apply…", a sender named after
//                     you) without ever seeing the name,
//          layout: ['images only' | 'text after a large blank gap'] (how the email hides its text),
//          mailChecks: kinds of headerAnomalies findings (AI_MAIL_CHECKS) }
// ---------------------------------------------------------------------------------------------------
const AI_MAX_LINKS = 8;

const AI_EMAIL_RE = /\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,})\b/g;
const AI_PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{3}\)[\s.-]?|\b\d{3}[\s.-])\d{3}[\s.-]\d{4}\b/g;
const AI_LONG_NUMBER_RE = /\b\d[\d -]{5,}\d\b/g;

// Email addresses keep their domain (where mail comes from matters, who it is for doesn't); phone
// numbers and long numbers (accounts, cards, codes) are replaced by what they are.
function redactForAi(text) {
    return String(text || '')
        .replace(AI_EMAIL_RE, (m, local, domain) => `address at ${domain.toLowerCase()}`)
        .replace(AI_PHONE_RE, 'phone number')
        .replace(AI_LONG_NUMBER_RE, 'number');
}

// Tags that mail systems add to EVERY outside email ("[EXTERNAL] …", "EXT: …", "CAUTION: …"): they say
// nothing about phishing (both kinds carry them), so the model never sees them.
function stripExternalTag(subject) {
    let s = String(subject || '');
    for (let i = 0; i < 3; i++) s = s.replace(/^\s*(\[\s*(external|ext|caution|warning|outside sender|non-district|external sender)[^\]]{0,30}\]|\*{0,3}\s*(external|ext|caution)\s*\*{0,3}\s*:)\s*/i, '');
    return s.trim();
}

// What a mail system along the way already found in the headers (headerAnomalies kinds), in words.
const AI_MAIL_CHECKS = Object.freeze({
    'spam-flag': 'already marked as spam by a mail system', 'local-tool': 'sent with a home-made bulk-mail tool',
    'broken-to': 'broken to address', 'placeholders': 'unfilled template placeholders', 'markup': 'web code in address lines',
    'forged-received': 'forged delivery records', 'duplicate-headers': 'repeated headers', 'fake-signature': 'fake signature'
});
const AI_LAYOUTS = new Set(['images only', 'text after a large blank gap']);

// The reader's own mailbox name, wherever it appears, becomes "your name" (whole words only, and only
// names of 3 or more letters, so "al" in "also" stays).
function maskRecipient(text, recipient) {
    const r = String(recipient || '').trim().toLowerCase();
    if (r.length < 3) return String(text || '');
    const esc = r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return String(text || '').replace(new RegExp(`(^|[^\\p{L}\\p{N}])${esc}(?=$|[^\\p{L}\\p{N}])`, 'giu'), '$1your name');
}

function modelInputParts(facts) {
    const f = facts || {};
    const mask = (t) => maskRecipient(redactForAi(t), f.recipient);
    const addr = String(f.senderAddress || '').toLowerCase();
    const domain = addr.split('@')[1] || 'unknown';
    const head = [];
    head.push(`subject: ${mask(stripExternalTag(f.subject) || 'none').slice(0, 160)}.`);
    const where = f.org === 'inside' ? ' (your organization)' : f.org === 'outside' ? ' (outside your organization)' : '';
    head.push(`from: "${mask(f.senderName || '').slice(0, 80)}" at ${domain}${where}${typeof isSharedMailbox === 'function' && isSharedMailbox(addr) ? ' (shared mailbox)' : ''}.`);
    const checks = [...new Set((f.mailChecks || []).map(k => AI_MAIL_CHECKS[k]).filter(Boolean))].slice(0, 4);
    head.push(`sender check: ${f.auth && f.auth.dmarc ? `dmarc ${f.auth.dmarc}` : 'unknown'}${checks.length ? `; ${checks.join('; ')}` : ''}.`);
    const links = (f.links || []).slice(0, AI_MAX_LINKS).map(l => {
        const text = mask(String(l.text || '').trim()).slice(0, 40) || 'image';
        const dest = l.destHost && l.destHost !== l.host ? `${l.host} then ${l.destHost}` : (l.host || 'unknown');
        return `"${text}" goes to ${dest}${l.finding ? ` (warning: ${redactForAi(l.finding).slice(0, 80)})` : ''}`;
    });
    head.push(links.length ? `links: ${links.join('; ')}.` : 'links: none.');
    const layout = (f.layout || []).filter(x => AI_LAYOUTS.has(x));
    if (layout.length) head.push(`layout: ${layout.join('; ')}.`);
    const body = mask(String(f.bodyText || '')).replace(/\s+/g, ' ').trim();
    return { head: head.join(' '), sentences: splitSentences(body) };
}

// Sentences (and line-like fragments), for the explanation; kept in order.
function splitSentences(text) {
    // Only at an end mark followed by a space, so addresses (www.example.com) and numbers stay whole.
    return String(text || '').split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 1).slice(0, 60);
}

function modelInputText(facts) {
    const p = modelInputParts(facts);
    return `${p.head} text: ${p.sentences.join(' ')}`;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { modelInputText, modelInputParts, redactForAi, stripExternalTag, maskRecipient, splitSentences, isSharedMailbox, AI_MAIL_CHECKS, AI_LAYOUTS, AI_MAX_LINKS };
}
