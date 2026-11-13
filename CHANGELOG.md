# Changelog

## phish-tiny 0.16.0: input format 2, the sender checks' findings in context

**A program syncing this model must switch its copy of the input format to version 2 in the same change**
(`modelInputParts` in its `ai.js`: the lines of `tools/model-input.js`; `model.json` says `"inputFormat": 2`).
`tools/model-input.js` builds format 1 with `modelInputText(facts, 1)`, for a program still running 0.13.0.

- **Input format 2** adds, each only when it applies: `identity:` (the brand or agency the sender's name claims
  and whether the sending domain is theirs, not known to be, or a personal mailbox; a domain imitating a
  well-known brand; a colleague's name on an outside address), failing SPF/DKIM in `sender check:`,
  `reply-to:` (domains that aren't the sender's), `attachments:` (the files' kinds, never their names), and a
  subject or text in capitals. These are what each program's own checks already find (`aiSenderIdentity`,
  `aiReplyToDomains`, `aiAttachmentFacts` in its `shared.js`); the model was trained on exactly what they give.
- **References:** `input-format.jsonl` has 94 made-up cases (12 new ones for format 2); `ai-vectors.json` and
  `model-reference.json` are for 0.16.0.
- Trained in TinyPhishLLM_Private_Training from 0.14.0 (which was never published here), six runs averaged.

Scores against 0.14.0 on the same held-out sets (never trained on; lower is better):

| | 0.14.0 @50% | 0.16.0 @50% | 0.14.0 @90% | 0.16.0 @90% | 0.14.0 @95% | 0.16.0 @95% |
|---|---|---|---|---|---|---|
| Published phishing missed (681 held-out variants) | 19 | **13** | 23 | **19** | 25 | **24** |
| Published genuine called phishing (705 held-out variants) | 33 | **20** | 17 | **10** | 16 | **10** |
| Genuine look-alikes called phishing (24) | 3 | **1** | 1 | **0** | 1 | **0** |
| Hand-written wrong (33) | 0 | 0 | 1 | **0** | 1 | **0** |
| Regression cases wrong (15) | 0 | 0 | 0 | 0 | 0 | 0 |

Not measured here: a district's own held-out emails. Score 0.16.0 on them (S.P.R.U.C.E Mail Protection
Service's `tools/score-examples.js`) before it reaches a program; committing it here releases nothing.

## phish-tiny 0.13.0: the repository starts

The model has its own repository, so the S.P.R.U.C.E+ extension and S.P.R.U.C.E+ Mail Protection use
one model, trained in one place, and both download it from here (each pins a commit and every file's
SHA-256). This repository holds only the released model; its training (scripts, published examples,
check sets, regression cases) is in the private TinyPhishLLM_Private_Training.

- **The model** is phish-tiny 0.13.0 as S.P.R.U.C.E+ Mail Protection 0.5.7 released it
  (`google_service_main`, commit `929db93`), unchanged: `model.bin`, `model.onnx`, `model.json`,
  `vocab.txt`, `MODEL_CARD.md`. It was trained (2026-11-11) with 1227 published examples and the
  extension's training tools, plus 96 de-identified examples from one district's own mail (in no
  repository), averaged over three runs.
- **References for the programs' tests, all made up:**
  - `input-format.jsonl`: 72 made-up emails built from lists of parts (every rule of the format) and 10
    edge cases; `tools/model-input.js` builds all 82 texts, and so must each program's own copy;
  - `ai-vectors.json`: token ids and outputs for six of those texts and one with unusual characters,
    computed from `model.bin` in double precision (the JavaScript runtime must match them to 0.001);
  - `model-reference.json`: the service's 400 made-up inputs and the model's answers (ONNX Runtime
    matches them exactly).
- **`tools/check.js`:** the model's files agree, the input format matches its reference, and only the
  model and made-up references are committed.

Scores of 0.13.0 (from its card, at the service's 90% line unless noted; held-out sets never trained on):

| | 0.11.0 | 0.13.0 |
|---|---|---|
| A district's genuine mail called phishing (23 held out) | 15 | 7 |
| A district's phishing caught (6 held out) | 2 | 3 |
| Published phishing missed (603) | 20 | 11 |
| Published genuine emails called phishing (624) | 17 | 13 |
| Genuine look-alikes called phishing (24) | 3 | 3 |
| Hand-written emails wrong (33) | 0 | 0 |
| Regression cases wrong (15, at 50%) | 0 | 0 |
