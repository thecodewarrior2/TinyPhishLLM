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
//          mailChecks: kinds of headerAnomalies findings (AI_MAIL_CHECKS),
//          --- format 2 (phish-tiny 0.16.0): the facts a program's own checks already found, so the model
//          judges the words in context ---
//          auth: also { spf, dkim }: said only when they fail,
//          identity: { brand, owner, lookalike, colleague } who the sender's name claims to be and whether
//                    the domain is theirs, from the program's own sender checks (aiSenderIdentity):
//                    brand: the brand or agency the name claims ('' none); owner: 'yes' (the domain is
//                    the brand's) | 'no' | 'unsure' (not known to be) | 'personal' (a free mailbox);
//                    lookalike: the domain imitates a well-known brand; colleague: the name is someone
//                    in the organization's, on an outside address,
//          replyTo: addresses (or domains) replies go to; only those not the sender's own domain count,
//          attachments: [{ name, type }] (file name and MIME type; only their kind is said, never the name) }
// Capitals (a subject or text written in capitals) are found here, from the text itself: the model's
// tokenizer reads lower case, so it can't see them otherwise.
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

// Format 2: the input format's version (model.json's inputFormat says which one a model reads).
const AI_INPUT_FORMAT = 2;

// Who the sender claims to be, in words (identity, from the program's sender checks).
const AI_IDENTITY_OWNER = Object.freeze({ yes: (b) => `the domain is ${b}'s`, no: (b) => `the domain is not ${b}'s`,
    unsure: (b) => `the domain is not known to be ${b}'s`, personal: () => 'sent from a personal mailbox' });
function identityLine(id) {
    if (!id || typeof id !== 'object') return '';
    const parts = [];
    const brand = String(id.brand || '').replace(/[^A-Za-z0-9&.' -]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 40).trim();
    if (brand && AI_IDENTITY_OWNER[id.owner]) parts.push(`name claims ${brand}; ${AI_IDENTITY_OWNER[id.owner](brand)}`);
    if (id.lookalike) parts.push('the domain imitates a well-known brand');
    if (id.colleague) parts.push('the name is a colleague\'s but the address is outside');
    return parts.length ? `identity: ${parts.join('; ')}.` : '';
}

// Where replies go, when that isn't the sender's own domain (or one of its subdomains).
function replyToLine(replyTo, senderDomain) {
    const own = String(senderDomain || '').toLowerCase();
    const same = (d) => d === own || d.endsWith('.' + own) || own.endsWith('.' + d);
    const domains = [...new Set([].concat(replyTo || []).map(a => String(a || '').toLowerCase().trim().split('@').pop())
        .filter(d => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d) && !same(d)))].slice(0, 2);
    return domains.length ? `reply-to: goes to ${domains.join(', ')} (not the sender's domain).` : '';
}

// What kind of files are attached, from the file name's ending and the MIME type (never the name itself).
const AI_ATTACHMENT_KINDS = [
    ['program or script', /\.(exe|scr|com|bat|cmd|msi|js|jse|vbs|vbe|wsf|wsh|ps1|lnk|jar|hta|cpl|reg|apk|appx|msix)$/, /x-msdownload|x-msdos|x-executable|javascript|x-sh\b|java-archive|x-ms-shortcut|hta/],
    ['disk image', /\.(iso|img|vhdx?|dmg)$/, /iso9660|x-raw-disk|apple-diskimage/],
    ['archive', /\.(zip|rar|7z|gz|tgz|tar|cab|ace|arj|xz|bz2|z)$/, /zip|rar|7z|compressed|x-tar|gzip|x-xz|bzip/],
    ['macro document', /\.(docm|dotm|xlsm|xltm|xlsb|xlam|pptm|potm|ppsm)$/, /macroenabled/],
    ['web page', /\.(html?|shtml|xhtml|svgz?|mht|mhtml)$/, /html|svg|multipart\/related/],
    ['calendar invite', /\.ics$/, /calendar/],
    ['pdf', /\.pdf$/, /pdf/],
    ['spreadsheet', /\.(xlsx?|ods|csv|numbers)$/, /spreadsheet|ms-excel|csv/],
    ['document', /\.(docx?|dotx|odt|rtf|txt|pptx?|odp|pages|key)$/, /msword|wordprocessing|presentation|powerpoint|opendocument|rtf|text\/plain/],
    ['picture', /\.(png|jpe?g|gif|bmp|webp|heic|tiff?)$/, /^image\//],
    ['audio or video', /\.(mp3|wav|m4a|ogg|mp4|mov|avi|wmv|webm)$/, /^(audio|video)\//]
];
function attachmentKind(name, type) {
    const n = String(name || '').toLowerCase().replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '').trim(), t = String(type || '').toLowerCase();
    for (const [kind, ext, mime] of AI_ATTACHMENT_KINDS) if (ext.test(n)) return kind;
    for (const [kind, ext, mime] of AI_ATTACHMENT_KINDS) if (t && mime.test(t)) return kind;
    return 'other file';
}
function attachmentsLine(attachments) {
    const kinds = [];
    for (const a of [].concat(attachments || []).slice(0, 20)) {
        if (!a || typeof a !== 'object') continue;
        const raw = String(a.name || '');
        kinds.push(attachmentKind(raw, a.type));
        // A name that hides its real type: text-direction characters, or a harmless ending before the real one
        // ("invoice.pdf.exe", "scan.pdf      .html").
        if (/[\u202a-\u202e\u2066-\u2069]/.test(raw) || /\.(pdf|docx?|xlsx?|jpe?g|png|txt)\s*\.[a-z0-9]{2,5}$/i.test(raw.trim())) kinds.push('a file name that hides its type');
    }
    const unique = [...new Set(kinds)].slice(0, 4);
    return unique.length ? `attachments: ${unique.join('; ')}.` : '';
}

// Text written in capitals (the tokenizer reads lower case, so the model is told).
function capitalsLayout(subject, body) {
    const ratio = (t) => { const letters = String(t || '').match(/\p{L}/gu) || []; const up = String(t || '').match(/\p{Lu}/gu) || []; return { n: letters.length, r: letters.length ? up.length / letters.length : 0 }; };
    const out = [], s = ratio(subject), b = ratio(body);
    if (s.n >= 8 && s.r > 0.8) out.push('subject in capitals');
    if (b.n >= 40 && b.r > 0.6) out.push('text mostly in capitals');
    return out;
}

// The reader's own mailbox name, wherever it appears, becomes "your name" (whole words only, and only
// names of 3 or more letters, so "al" in "also" stays).
function maskRecipient(text, recipient) {
    const r = String(recipient || '').trim().toLowerCase();
    if (r.length < 3) return String(text || '');
    const esc = r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return String(text || '').replace(new RegExp(`(^|[^\\p{L}\\p{N}])${esc}(?=$|[^\\p{L}\\p{N}])`, 'giu'), '$1your name');
}

// format: the input format to build (AI_INPUT_FORMAT unless a program runs an older model; 1 has none of
// format 2's lines).
function modelInputParts(facts, format = AI_INPUT_FORMAT) {
    const f = facts || {};
    const v2 = format >= 2;
    const mask = (t) => maskRecipient(redactForAi(t), f.recipient);
    const addr = String(f.senderAddress || '').toLowerCase();
    const domain = addr.split('@')[1] || 'unknown';
    const head = [];
    head.push(`subject: ${mask(stripExternalTag(f.subject) || 'none').slice(0, 160)}.`);
    const where = f.org === 'inside' ? ' (your organization)' : f.org === 'outside' ? ' (outside your organization)' : '';
    head.push(`from: "${mask(f.senderName || '').slice(0, 80)}" at ${domain}${where}${typeof isSharedMailbox === 'function' && isSharedMailbox(addr) ? ' (shared mailbox)' : ''}.`);
    const checks = [...new Set((f.mailChecks || []).map(k => AI_MAIL_CHECKS[k]).filter(Boolean))].slice(0, 4);
    const idLine = v2 ? identityLine(f.identity) : '';
    if (idLine) head.push(idLine);
    // SPF and DKIM are said only when they fail (DMARC already sums up a pass).
    const fails = [];
    if (v2) {
        if (f.auth && /^(fail|softfail|permerror)$/.test(String(f.auth.spf || '').toLowerCase())) fails.push(`spf ${String(f.auth.spf).toLowerCase()}`);
        if (f.auth && /^(fail|permerror)$/.test(String(f.auth.dkim || '').toLowerCase())) fails.push(`dkim ${String(f.auth.dkim).toLowerCase()}`);
    }
    head.push(`sender check: ${f.auth && f.auth.dmarc ? `dmarc ${f.auth.dmarc}` : 'unknown'}${fails.length ? `; ${fails.join('; ')}` : ''}${checks.length ? `; ${checks.join('; ')}` : ''}.`);
    const rtLine = v2 ? replyToLine(f.replyTo, domain) : '';
    if (rtLine) head.push(rtLine);
    const links = (f.links || []).slice(0, AI_MAX_LINKS).map(l => {
        const text = mask(String(l.text || '').trim()).slice(0, 40) || 'image';
        const dest = l.destHost && l.destHost !== l.host ? `${l.host} then ${l.destHost}` : (l.host || 'unknown');
        return `"${text}" goes to ${dest}${l.finding ? ` (warning: ${redactForAi(l.finding).slice(0, 80)})` : ''}`;
    });
    head.push(links.length ? `links: ${links.join('; ')}.` : 'links: none.');
    const attLine = v2 ? attachmentsLine(f.attachments) : '';
    if (attLine) head.push(attLine);
    const layout = [...new Set([...(f.layout || []).filter(x => AI_LAYOUTS.has(x)), ...(v2 ? capitalsLayout(stripExternalTag(f.subject), f.bodyText) : [])])];
    if (layout.length) head.push(`layout: ${layout.join('; ')}.`);
    const body = mask(String(f.bodyText || '')).replace(/\s+/g, ' ').trim();
    return { head: head.join(' '), sentences: splitSentences(body) };
}

// Sentences (and line-like fragments), for the explanation; kept in order.
function splitSentences(text) {
    // Only at an end mark followed by a space, so addresses (www.example.com) and numbers stay whole.
    return String(text || '').split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 1).slice(0, 60);
}

function modelInputText(facts, format = AI_INPUT_FORMAT) {
    const p = modelInputParts(facts, format);
    return `${p.head} text: ${p.sentences.join(' ')}`;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AI_INPUT_FORMAT, identityLine, replyToLine, attachmentsLine, attachmentKind, capitalsLayout, modelInputText, modelInputParts, redactForAi, stripExternalTag, maskRecipient, splitSentences, isSharedMailbox, AI_MAIL_CHECKS, AI_LAYOUTS, AI_MAX_LINKS };
}
