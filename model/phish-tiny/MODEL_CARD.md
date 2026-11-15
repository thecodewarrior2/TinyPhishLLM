# phish-tiny 0.19.0

An ELECTRA-small classifier (google/electra-small-discriminator, 12 layers, 13.5 million parameters) fine-tuned to tell phishing from
genuine email, from the facts the programs collect (subject, sender name and domain, DMARC result,
links and their checks) and the email's text with addresses and numbers redacted. It reads input format 2: also what the programs' sender checks found (who the sender's name claims to be and whether the domain is theirs, Reply-To domains that aren't the sender's, the attached files' kinds, failing SPF/DKIM) and text in capitals; a program must build that format's text for it (`model-input.js`, `model.json` `inputFormat`). Trained 2026-11-15
by TinyPhishLLM's `training/train.py` with 3 epochs at learning rate 0.0001; weights stored in 8 bits.

**Training data:** 21301 emails from `training/make-dataset.js`: synthetic ones from its templates, and variants
of two thirds of `training/real-world.jsonl` (phishing and email scams that universities, school groups,
the FTC, FBI, IRS and others published as warnings, including spear phishing and business email
compromise; paraphrased, with made-up names; no real email, personal data or bank details), plus 504 rows from a district's own de-identified examples in `training/data/extra/` (never committed or published; each example may be repeated, `make-dataset.js --extra-repeat`). Pair loss 0.2 (a phishing email and its genuine twin at least 2 apart in the model's raw score, its logit). Margin loss 0.2 (pushes each training email's answer past 0.95 probability on its side).

**Scores of the exported model**

| Set | Accuracy | Precision | Recall | False alarms | Missed |
|---|---|---|---|---|---|
| Synthetic test (1500, same templates, other seed) | 0.996 | 0.996 | 0.996 | 3 | 3 |
| Hand-written (33, not from the templates) | 1.0 | 1.0 | 1.0 | 0 | 0 |
| Real-world, held out (681: 3 variants of each of 227 published examples never trained on; all phishing) | 0.9912 | - | 0.9912 | - | 6 |
| Genuine look-alikes (24, hand-written, never trained on; all genuine) | 0.9583 | - | - | 1 | - |
| Real-world genuine, held out (705: 3 variants of each of 235 published genuine emails never trained on) | 0.9943 | - | - | 4 | - |

Hand-written emails it got wrong: none.
Held-out real-world examples it missed (any variant): real:haynie-comptroller-transferxl-file, real:mhc-unesco-observer-invite-hotel, real:mrsc-hacked-vendor-asks-county-banking, real:threatdown-microsoft-unusual-signin, real:uvic-staff-student-support-program-grant.
Genuine look-alikes it called phishing: look:docusign-lease (0.992).
Held-out published genuine emails it called phishing (any variant): real:brown-uhcsr-1095b-ssn-genuine, real:rge-honey-paypal-rewards-points-genuine.

**Limits:** the synthetic score mostly measures how well it learned the templates. The hand-written
score is the better check, but it is small, and it is OPTIMISTIC: while building this experiment the
generator was improved after looking at which hand-written emails the model got wrong, so those emails
have partly shaped the training.

The genuine look-alikes (`training/eval-lookalikes.jsonl`) are the false-alarm check: genuine mail that
resembles spear phishing and scams (a leader asking for a call, payroll and closing notices that mention
deposits and wires, real DocuSign, Microsoft and PayPal notices). They were written alongside the
generator's genuine look-alike kinds, by the same hand, so the score is somewhat optimistic; they are
never trained on, and the generator is not changed to fit them. Model 0.4.0 called 10 of these 24
phishing.

The real-world held-out set is the most honest number for missed phishing, with three caveats: it is all
phishing (it measures missed phishing, not false alarms); it is small (variants of 227 published examples, mostly
aimed at universities); and its variants get the same random sender, layout and wording changes as the
training data. It was never trained on, and the generator was not changed to fit it, but its score was
seen between training runs (model 0.10.0, before 183 more examples from new sources were added: 549 of
564 on this set, and 484 of the 528 held-out genuine variants right). Held-out emails often come from
the same sources as trained ones (several emails from one payroll office or archive), so these scores
are somewhat optimistic. One training run's scores move with its random seed (by up to 24 of 243
genuine variants on 0.8.0's data); this model is one run, so compare it with others before trusting a small difference.

**Regression cases** (`training/regressions.jsonl`): emails earlier versions got wrong, reported
by the maintainer and paraphrased without personal data: genuine ones (a deal-site newsletter, a security
vendor's sales thread, an automated district reimbursement statement) and missed spam (a credit-card
offer in pictures, a fake cloud-storage notice, an IPTV offer); plus genuine look-alikes of that spam (a
store coupon in pictures, a bank's card offer, a real storage-full notice). The generator was extended
because of them, so they are a regression check, not an independent score. Real-world accuracy needs
real, labelled, de-identified examples (add them in `training/data/extra/`). English only. Advisory only
in the extension: it never clears a warning or moves email.
