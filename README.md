# TinyPhishLLM: the phish-tiny model

**phish-tiny** is a small language model (a BERT-tiny classifier, 4.4 million parameters, 4.5 MB) that
reads an email and says how likely it is phishing. This repository is where the programs that use it
get it: the released model, its input format, and the made-up reference answers the programs test
themselves against. There is one model, trained in one place.

**Current model: phish-tiny 0.16.0** (trained 2026-11-13). It reads **input format 2** (`"inputFormat": 2` in
`model.json`): besides the email itself, what the program's own sender checks found (who the sender's name
claims to be and whether the domain is theirs, Reply-To domains that aren't the sender's, the attached files'
kinds, failing SPF/DKIM) and text in capitals. A program must build exactly that text for it
(`tools/model-input.js`), so it switches its copy of the format to version 2 when it syncs this model. Its
scores are in `model/phish-tiny/MODEL_CARD.md` and `CHANGELOG.md`.

The training (scripts, published examples, check sets) is in a separate **private** repository,
TinyPhishLLM_Private_Training. Nothing used to train the model is here, and nothing here comes from anyone's
mailbox.

## Who uses the model

| Program | Where the model goes | How it runs it |
|---|---|---|
| **S.P.R.U.C.E+ browser extension** (`spruce-browser-extension`, branch `llm_testing`) | `models/phish-tiny/` (`model.bin`, `model.json`, `vocab.txt`, `MODEL_CARD.md`) | plain JavaScript (`ai.js`), on the user's computer |
| **S.P.R.U.C.E Mail Protection Service** (`google_service_testing`, released to `google_service_main`) | `vendor/spruce/models/phish-tiny/` (`model.onnx`, `model.json`, `vocab.txt`, `MODEL_CARD.md`) | ONNX Runtime, in the district's own Google Cloud project |

Each program **pins one commit of this repository and each file's SHA-256** (`models/phish-tiny/SOURCE.json`
in the extension; `vendor/spruce/VENDOR.json`, `modelSource`, in the service), written by its
`node tools/sync-model.js <TinyPhishLLM folder>`. The programs don't keep the model files themselves:
`tools/fetch-model.js` in each downloads them from this repository at the pinned commit when the program
is built (the extension's package; the service's image, on install, on update from Cloud Shell and on
Settings → Update) or tested, and stops if a file's SHA-256 is not the pinned one. So this repository
must stay public, and a commit a program pins must stay on `main` (never rewrite it).

Nothing is downloaded while the programs run: the model is inside each built package or image.

## Layout

| Path | What |
|---|---|
| `model/phish-tiny/` | The model: `model.bin` (8-bit weights), `model.onnx` (the same network for ONNX Runtime), `model.json` (manifest, metrics), `vocab.txt`, `MODEL_CARD.md` |
| `model/reference/input-format.jsonl` | 94 made-up emails' facts and the exact text the model reads for each: every program's copy of the input format is tested against it |
| `model/reference/ai-vectors.json` | Token ids and outputs for made-up texts: the JavaScript runtime must match them |
| `model/reference/model-reference.json` | 400 made-up inputs and the model's answers: the ONNX runtime must match them |
| `tools/model-input.js` | The input format: the text the model reads, built from an email's facts (the training repository's own copy, published unchanged) |
| `tools/check.js` | Checks the files agree, the format matches its reference, and only the model and made-up references are here |

## A new model

It is trained, scored and checked in TinyPhishLLM_Private_Training, then `node training/publish.js <this folder>`
copies the model and its references here (nothing else), `node tools/check.js` passes, and a
`CHANGELOG.md` entry gives its scores. Each program then syncs it (`node tools/sync-model.js`), runs its
tests, and releases it under its own rules: a new model reaches people only in a program's version
that the maintainer has tried and approved. Committing here releases nothing.

## Privacy

No real person's details, no email from anyone's mailbox, no training example and no bank details are in
this repository. The references are made-up emails (`.example` domains, made-up names). Examples from a
district's own mail are used only on the computer that trains and are never committed anywhere.

The base model is BERT-tiny (Google's BERT miniatures, as published by prajjwal1 under the MIT licence).
