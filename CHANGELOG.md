# Changelog

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
