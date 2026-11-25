# Changelog

## phish-tiny 0.29.0: misses fewer phishing; a district's numbers kept

Same architecture, vocabulary, **input format 3** and spam answer as 0.28.0: no program's copy of the input format
changes. Trained from 0.28.0: fifteen runs (three kinds of training data, five each), averaged into one model; also on
published research collections (people taken out, never published) and a district's examples (never published). At the
65% line, held-out sets never trained on (lower is better):

| | 0.28.0 | 0.29.0 |
|---|---|---|
| Research collections' phishing missed (2,936) | 57 | 33 |
| Research collections' genuine called phishing (4,072) | 86 | 77 |
| Research collections' spam missed (3,759) | 111 | 101 |
| A district's held-out genuine called phishing (54) / marketing called phishing (133) | 9 / 15 | 9 / 15 |
| A district's newest held-out marketing called phishing (32) | 3 | 3 |
| Published phishing missed (954) / published genuine called phishing (834) | 15 / 7 | 16 / 7 |
| Platform shares, look-alikes, context pairs wrong (14, 24, 55) | 0, 1, 0 | 0, 1, 0 |
| Hand-written cases wrong (33) / regression cases wrong (19) | 0 / 0 | 0 / 0 |

The made-up first-time vendor asking to update its bank details (DMARC passing) scores 96% phishing (0.28.0: 81%).

## phish-tiny 0.28.0: catches the new-vendor bank-details case; far fewer missed phishing

Same architecture, vocabulary, **input format 3** and spam answer as 0.27.0: no program's copy of the input format
changes. Trained from 0.27.0 (five runs averaged), kept close to 0.27.0's answers only where 0.27.0 is right; also
trained on published research collections (people taken out, never published) and a district's examples (never
published). At the 65% line, held-out sets never trained on (lower is better):

| | 0.27.0 | 0.28.0 |
|---|---|---|
| Research collections' phishing missed (2,936) | 236 | 57 |
| Research collections' spam missed (3,759) | 145 | 111 |
| Research collections' genuine called phishing (4,072) | 93 | 86 |
| A district's held-out phishing or spam missed (188) | 18 | 15 |
| A district's newer held-out phishing or spam missed (32) / genuine called phishing (1) | 13 / 0 | 12 / 1 |
| A district's held-out genuine called phishing (54) | 9 | 9 |
| Published phishing missed (954) / published genuine called phishing (834) | 15 / 7 | 15 / 7 |
| Platform shares, look-alikes, context pairs wrong (14, 24, 55) | 2, 1, 2 | 0, 1, 0 |
| Hand-written cases wrong (33) | 0 | 0 |
| Regression cases wrong (19) | 1 | 0 |

The regression case 0.27.0 failed, a made-up first-time vendor asking to update its bank details for an invoice with its
sender verified (DMARC passing), now scores 80.8% phishing (0.27.0: 12.7%). Two of the five runs alone still scored it
under the 65% line, so a program should still catch a payment-change request from a new sender with its own rules.

## phish-tiny 0.27.0: fewer missed phishing and spam; one known weakness kept

Same architecture, vocabulary, **input format 3** and spam answer as 0.26.0: no program's copy of the input format
changes. Trained from 0.26.0 (five runs averaged), also on published research collections (people taken out, never
published) and a district's examples (never published). At the 65% line, held-out sets never trained on (lower is
better):

| | 0.26.0 | 0.27.0 |
|---|---|---|
| Research collections' phishing missed (2,936) | 280 | 236 |
| Research collections' spam missed (3,759) | 209 | 145 |
| Research collections' genuine called phishing or spam (4,072) | 110 | 93 |
| A district's held-out phishing or spam missed (188) | 27 | 18 |
| A district's newer held-out phishing or spam missed (32) / genuine called phishing (1) | 15 / 1 | 13 / 0 |
| A district's held-out genuine called phishing (54) | 10 | 9 |
| Published phishing missed (954) / published genuine called phishing or spam (834) | 18 / 8 | 15 / 7 |
| Platform shares, look-alikes, context pairs wrong (14, 24, 55) | 2, 1, 2 | 2, 1, 2 |
| Hand-written cases wrong (33) | 0 | 0 |
| Regression cases wrong (19) | 1 | 1 |

**Known weakness, released by the maintainer's decision:** one regression case still fails, as it does for 0.26.0: a
made-up first-time vendor asking to update its bank details for an invoice, its sender verified (DMARC passing), scores
12.7% phishing (0.26.0: 13.2%). A program should catch a payment-change request from a new sender with its own rules.
Publishing releases nothing.

## phish-tiny 0.26.0: a spam answer of its own; marketing is no longer called phishing

Same architecture, vocabulary and **input format 3** as 0.25.0: no program's copy of the input format changes. New: a
second output, `spam_logits` (genuine, spam), beside `logits`; `model.json` has `"spam"`. P(spam) = (1 - P(phishing)) x
softmax(spam_logits)[1]. A program that reads only `logits` runs this model unchanged and gets P(phishing) without
spam in it; reading the spam answer is each program's own change. Trained from 0.25.0 (three runs averaged), also on
published research collections of spam (people taken out, never published) and a district's examples (never
published). At the 65% line, held-out sets never trained on (lower is better):

| | 0.25.0 | 0.26.0 |
|---|---|---|
| Synthetic test: spam called phishing at 50% (374) | 272 | 16 |
| Research collections' spam called phishing at 50% (3,759) | 2,809 | 587 |
| Research collections' genuine called phishing at 50% (4,072) | 106 | 24 (105 called spam) |
| Research collections' phishing missed (2,936) | 383 | 280 |
| A district's held-out phishing or spam missed (188) | 94 | 27 |
| A district's held-out genuine called phishing (54) | 9 | 10 (4 called spam) |
| Published phishing missed (954 held-out variants) | 14 | 18 |
| Published genuine called phishing or spam (834) | 6 | 8 |
| Spam check set: spam called phishing (23) / phishing missed (6) | 10 / 0 | 0 / 0 |
| Platform shares, look-alikes, context pairs wrong (14, 24, 55) | 2, 1, 2 | 2, 1, 2 |
| Hand-written and regression cases wrong (33, 18) | 0, 0 | 0, 0 |

Published phishing missed (+4) and published genuine false alarms (+2) are worse within the resampling interval. A
program that reads the spam answer should not move mail on it alone: about 2.6% of the collections' genuine mail is
called spam (most of it real spam in Enron's inboxes). Publishing releases nothing.

## phish-tiny 0.25.0: also learns from published research collections; fewer missed phishing and district false alarms

Same architecture, vocabulary and **input format 3** as 0.22.0 (a program running 0.22.0 runs this one unchanged). Its
training adds published research collections of real phishing and genuine mail (people taken out, never published),
more published shop scams and genuine shop mail, and a district's fourth export (never published); no teacher. One run.
Scores against 0.22.0 (held-out sets, never trained on; lower is better):

| | 0.22.0 @90% | 0.25.0 @90% |
|---|---|---|
| A district's held-out phishing or spam missed (25) | 19 | 12 |
| A district's held-out genuine called phishing (94) | 13 | 5 |
| Published phishing missed (954 held-out variants) | 31 | 19 |
| Published genuine called phishing (861 held-out variants) | 5 | 6 |
| Research collections' phishing missed (890 held out) | 264 | 30 |
| Research collections' genuine called phishing (2,235 held out) | 192 | 38 |
| Context pairs wrong (55) | 0 | 3 |
| Platform shares wrong (14) | 2 | 3 |
| Hand-written and regression cases wrong (33, 18) | 0, 0 | 0, 0 |

Both made-up shop lures that withdrew 0.23.0 are caught. Check in a program before it syncs: a made-up newsletter with
the "text after a large blank gap" layout line scores about 50% (0.22.0: 0.4% for one, 99.9% for another), below a 90%
line; a made-up genuine account-suspension notice is 91%. Publishing releases nothing.


## phish-tiny 0.24.0 withdrawn: 0.22.0 is the current model again

0.24.0 (below) is withdrawn before any program used it: it reads text hidden below a large blank gap (a spam trick) as
phishing on its own, so a store sale with it scores 99.5% (0.22.0: 32%), and a program would treat such marketing as
phishing instead of as spam. This commit restores 0.22.0's files unchanged (the same bytes as commit c3cc873). The
0.24.0 commit stays in the history, as every published commit does, but no program should sync it.


## phish-tiny 0.24.0: learns from a bigger teacher; fewer false alarms on a district's mail

Same architecture, vocabulary and **input format 3** as 0.22.0 (a program running 0.22.0 runs this one unchanged).
It also learned from a bigger model's scores (Horizon-Labs/phishing-scam-detector-base, Apache-2.0, fine-tuned on
the public training rows only), and is the average of two such runs' weights. Scores against 0.22.0 (held-out sets,
never trained on; lower is better):

| | 0.22.0 @90% | 0.24.0 @90% |
|---|---|---|
| A district's held-out genuine called phishing (75) | 7 | 3 |
| A district's held-out phishing or spam missed (12) | 8 | 5 |
| Published phishing missed (771 held-out variants) | 18 | 16 |
| Published phishing missed, with 157 newer published examples (930) | 26 | 19 |
| Published genuine called phishing (846 held-out variants) | 5 | 4 |
| Context pairs wrong (55) | 0 | 1 |
| Platform shares wrong (14) | 2 | 2 |
| Hand-written and regression cases wrong (33, 18) | 0, 0 | 0, 0 |

Both made-up shop lures that withdrew 0.23.0 are caught (99.8% and 99.9%).


## phish-tiny 0.23.0 withdrawn: 0.22.0 is the current model again

0.23.0 (below) is withdrawn before any program used it: it calls a shop's reward or "account on hold" lure genuine
when the sender passes its sender check (two made-up examples: 6% and 0.4%; 0.22.0: 99.7% for both), which the
held-out sets didn't test. This commit restores 0.22.0's files unchanged (the same bytes as commit 8ba9d9e). The
0.23.0 commit stays in the history, as every published commit does, but no program should sync it.


## phish-tiny 0.23.0: catches more phishing; the same false alarms at the 90% line

Same architecture, vocabulary and **input format 3** as 0.22.0 (a program running 0.22.0 runs this one unchanged).
Trained with more of one district's own de-identified mail (never published), its genuine examples weighted more than
its phishing or spam. Scores against 0.22.0 (held-out sets, never trained on; lower is better):

| | 0.22.0 @90% | 0.23.0 @90% |
|---|---|---|
| Published phishing missed (771 held-out variants) | 18 | 10 |
| Published genuine called phishing (846 held-out variants) | 5 | 5 |
| (the same at 50%) | 5 | 11 |
| A district's held-out genuine called phishing (75) | 7 | 7 |
| A district's held-out phishing or spam missed (12) | 8 | 5 |
| Context pairs wrong (55) | 0 | 3 |
| Platform shares wrong (14) | 2 | 4 |
| Hand-written and regression cases wrong (33, 16) | 0, 0 | 0, 0 |

Better: published phishing missed (−8 at 90%, outside the resampling interval; a second training seed caught more
too). Worse: more genuine mail between 50% and 90%, a payroll file shared from outside and a wire request built from
public information scored lower. Committing it here releases nothing: a program uses it only in a version the
maintainer has tried and approved.

## phish-tiny 0.22.0: far fewer false alarms on a district's own mail; misses one compromised-account scam

Same architecture, vocabulary and **input format 3** as 0.21.0 (a program running 0.21.0 runs this one unchanged).
Trained with more of one district's own de-identified mail (never published). Scores against 0.21.0 (held-out sets,
never trained on; lower is better):

| | 0.21.0 @90% | 0.22.0 @90% |
|---|---|---|
| A district's held-out genuine called phishing (45) | 4 | 2 |
| (the same at 50%) | 10 | 2 |
| A district's held-out phishing missed (3) | 0 | 0 |
| A district's reported compromised-account scam missed (1) | 0 | 1 |
| Published phishing missed (771 held-out variants) | 16 | 18 |
| Published genuine called phishing (846 held-out variants) | 5 | 5 |
| Context pairs wrong (55) | 3 | 0 |
| Hand-written and regression cases wrong (33, 16) | 0, 0 | 0, 0 |

Worse: one reported scam from a compromised staff account is no longer caught. Committing it here releases nothing:
a program uses it only in a version the maintainer has tried and approved.

## phish-tiny 0.21.0: input format 3, a long email's last sentences reach the model (0.20.0's weights)

The same weights as 0.20.0, reading **input format 3**: a text of more than 60 sentences keeps its first 40 and its
last 20 (format 2 kept its first 60), so the model's start-and-end reading sees a long email's real ending.
**A program must change its copy of the format before it syncs this model** (`splitSentences(text, format)` in
`tools/model-input.js`; `AI_INPUT_FORMAT` 3); the new reference case `edge:long-text-start-and-end` (75 numbered
sentences) checks it. Shorter texts read as in format 2, so every score of 0.20.0 holds.

On long emails (held-out examples with 70 made-up newsletter sentences before their own text), with the same weights:

| | format 2 | format 3 |
|---|---|---|
| Published phishing flagged at 90% (771 held-out variants) | 638 | 696 |
| Published genuine flagged at 90% (846 held-out variants) | 4 | 4 |

Committing it here releases nothing: a program uses it only in a version the maintainer has tried and approved.

## phish-tiny 0.20.0: reads a long email's start and its end; far fewer missed phishing emails

Same architecture (ELECTRA-small), vocabulary and **input format 2** as 0.19.0, but **a program must change how it
cuts a long input before it syncs this model:** an input longer than 256 word pieces keeps `[CLS]`, its first
`config.headTokens` (192) pieces, its last `maxLen - 2 - headTokens` (62) and `[SEP]`; a model without
`headTokens` keeps its first 254 as before. A program should also give the model the end of a long email (the
extension and the service keep a body's first 6000 and last 2000 characters). `model-reference.json` and
`ai-vectors.json` include long made-up inputs, so a program that cuts differently fails its reference test.
Trained with long-email variants and more published examples, phishing and genuine.

Scores against 0.19.0 on the same held-out sets (never trained on, and larger than in 0.19.0's entry; lower is better):

| | 0.19.0 @50% | 0.20.0 @50% | 0.19.0 @90% | 0.20.0 @90% | 0.19.0 @95% | 0.20.0 @95% |
|---|---|---|---|---|---|---|
| **Published phishing missed (771 held-out variants)** | 60 | **11** | 75 | **16** | 78 | **17** |
| **Synthetic test phishing missed (1500)** | 59 | **9** | 68 | **16** | 72 | **19** |
| A district's reported phishing missed (1) | 1 | 0 | 1 | 0 | 1 | 1 |
| A district's held-out genuine called phishing (29) | 2 | 1 | 0 | 0 | 0 | 0 |
| Published genuine called phishing (774 held-out variants) | 3 | 5 | 3 | 5 | 3 | 5 |
| Genuine look-alikes called phishing (24) | 1 | 1 | 0 | 1 | 0 | 1 |
| Context pairs wrong (55) | 4 | 4 | 3 | 4 | 3 | 4 |
| Trigger-word genuine emails called phishing (25) | 1 | 1 | 0 | 1 | 0 | 1 |
| Platform-share checks wrong (14) | 0 | 0 | 3 | 2 | 3 | 2 |
| Hand-written wrong (33) | 0 | 0 | 0 | 0 | 1 | 0 |
| Regression cases wrong (16) | 0 | 0 | 0 | 0 | 0 | 0 |

Worse: about six more genuine emails called phishing across the sets at 90%, mostly short account and security
notices. One training run. Committing it here releases nothing: a program uses it only in a version the maintainer
has tried and approved.

## phish-tiny 0.19.0: far fewer false alarms on a district's own mail, fewer missed phishing

Same architecture (ELECTRA-small), vocabulary and **input format 2** as 0.18.0: a program that runs 0.18.0 runs this
one unchanged. Trained from Google's base with a district's own de-identified examples (never published) and two
new training losses (a phishing email and its genuine twin kept apart; each training email pushed past 95% on its
side).

Scores against 0.18.0 on the same held-out sets (never trained on; lower is better):

| | 0.18.0 @50% | 0.19.0 @50% | 0.18.0 @90% | 0.19.0 @90% | 0.18.0 @95% | 0.19.0 @95% |
|---|---|---|---|---|---|---|
| A district's held-out genuine called phishing (29) | 13 | **2** | 12 | **0** | 11 | **0** |
| A district's held-out phishing missed (1) | 0 | 0 | 0 | 0 | 0 | 0 |
| Published phishing missed (681 held-out variants) | 8 | 6 | 13 | **6** | 14 | **7** |
| Published genuine called phishing (705 held-out variants) | 5 | 4 | 4 | 3 | 4 | 3 |
| Genuine look-alikes called phishing (24) | 1 | 1 | 1 | 0 | 1 | 0 |
| Platform-share checks wrong (14) | 0 | 0 | 1 | 3 | 1 | 3 |
| Hand-written wrong (33) | 0 | 0 | 0 | 0 | 0 | 1 |
| Regression cases wrong (16) | 0 | 0 | 0 | 0 | 0 | 0 |

Worse: two more platform-share check cases fall under the 90% line (still above 50%). One training run; the district
set is small. Committing it here releases nothing: a program uses it only in a version the maintainer has tried and
approved.

## phish-tiny 0.18.0: ELECTRA-small; the BERT-tiny model kept as phish-tiny-old, unused

**phish-tiny is now an ELECTRA-small classifier** (`google/electra-small-discriminator`, Apache 2.0: 12 layers, 256 wide,
embeddings 128 wide and projected; 13.5 million parameters; `model.bin` 13.9 MB in 8 bits, `model.onnx` 14 MB).
Same input format (2) and vocabulary as 0.16.0. **A program must run the new architecture** (`model.json`
`"arch": "electra"`, `config.embedding` 128): after the embeddings' LayerNorm, `electra.embeddings_project`; at the
end, on the first token, `classifier.dense`, GELU (erf), `classifier.out_proj`. The encoder layers are as before,
under `electra.` instead of `bert.`. `model.onnx` is the whole network; ONNX Runtime at its "basic" optimization
level matches `model-reference.json` to 3e-6 ("all" fuses kernels and drifts by up to 0.007).

**`model/phish-tiny-old/`** is the BERT-tiny model that was phish-tiny until 0.17.0 (0.17.0, never published here
before), renamed and **not used** by any program.

Scores against 0.17.0 on the same held-out sets (never trained on; lower is better):

| | 0.17.0 @50% | 0.18.0 @50% | 0.17.0 @95% | 0.18.0 @95% |
|---|---|---|---|---|
| Published phishing missed (681 held-out variants) | 14 | **8** | 18 | **14** |
| Published genuine called phishing (705 held-out variants) | 20 | **5** | 14 | **4** |
| Genuine look-alikes called phishing (24) | 1 | 1 | 1 | 1 |
| Hand-written wrong (33) | 0 | 0 | 0 | 0 |
| Regression cases wrong (16) | 1 | **0** | 1 | **0** |

It also recognizes a document shared through Google Docs, OneDrive, DocuSign, Dropbox or Adobe by an account at
another organization naming the reader's leaders (14 of 14 such check cases; 0.17.0: 7). One training run, not an
average of six; a district's own examples are not in it. Committing it here releases nothing: a program uses it only
in a version the maintainer has tried and approved.

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
