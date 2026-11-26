# phish-tiny 0.30.0

An ELECTRA-small classifier (google/electra-small-discriminator, 12 layers, 13.5 million parameters) fine-tuned to tell phishing from
genuine email, from the facts the programs collect (subject, sender name and domain, DMARC result,
links and their checks) and the email's text with addresses and numbers redacted. It reads input format 4: format 3's facts (who the sender's name claims to be and whether the domain is theirs, Reply-To domains that aren't the sender's, the attached files' kinds, failing SPF/DKIM, text in capitals), plus, when a program has them, the facts beyond the email in a "context:" line (Gmail's category, unsubscribe and mailer, how long and how often the organization has had clean mail from the sender, the thread, how many of the organization's mailboxes got copies, the sender domain's age) and the text of attached documents and pictures ("attachment text:", "picture text:"). Without those facts its text is format 3's. A program must build that format's text for it (`model-input.js`, `model.json` `inputFormat`). Trained 2026-11-26
by TinyPhishLLM's `training/train.py`, from phish-tiny 0.29.0 (`--init`), in five runs (seeds 7 to 11; run "o"), every one in two steps: on a Kaggle GPU, 2 epochs at learning rate 0.00005 on the training rows without a district's (`--distill 0.8 --distill-where-right`: its phishing answers kept close to 0.29.0's on the rows 0.29.0 gets right, except spam), then on the computer that trains, 1 epoch at 0.00003 on the district's rows and 3,000 other training rows (`training/colab/finish-district.py`, `--distill 0.5 --distill-where-right`). The weights of the five runs (cand-o-s7 to s11) averaged into one model; weights stored in 8 bits.

**Training data:** 49568 emails (21789 of them with made-up facts beyond the email, `make-dataset.js --context 0.7 --known-pairs 400 --picture-pairs 300`) from `training/make-dataset.js`: synthetic ones from its templates, and variants
of two thirds of `training/real-world.jsonl` (phishing and email scams that universities, school groups,
the FTC, FBI, IRS and others published as warnings, including spear phishing and business email
compromise; paraphrased, with made-up names; no real email, personal data or bank details), including 1168 rows from a district's own de-identified examples in `training/data/extra/` (never committed or published; each example may be repeated, `make-dataset.js --extra-repeat`). A text longer than 256 tokens is read by its first 192 and its last 62 word pieces (`model.json` `config.headTokens`): a program must cut it the same way.

**Scores of the exported model**

| Set | Accuracy | Precision | Recall | False alarms | Missed |
|---|---|---|---|---|---|
| Synthetic test (1800, same templates, other seed) | 0.9989 | 0.9987 | 0.9987 | 1 | 1 |
| Hand-written (33, not from the templates) | 1.0 | 1.0 | 1.0 | 0 | 0 |
| Real-world, held out (954: 3 variants of each of 318 published examples never trained on; all phishing) | 0.9822 | - | 0.9822 | - | 17 |
| Genuine look-alikes (24, hand-written, never trained on; all genuine) | 1.0 | - | - | 0 | - |
| Real-world genuine, held out (834: 3 variants of each of 278 published genuine emails never trained on) | 0.994 | - | - | 5 | - |

**The spam answer** (output `spam_logits`, `model.json` `spam`): P(spam) = (1 - P(phishing)) x softmax(spam_logits)[1]. Spam is
unwanted bulk mail that sells something and doesn't try to steal; it is not phishing, so the phishing answer
(`logits`) is trained to stay low on it.

| Set | Spam | Called spam (most likely of the three) | Unwanted (spam + phishing at 50%) | Called phishing at 50% | at 90% | Genuine called spam at 50% |
|---|---|---|---|---|---|---|
| Synthetic test (same templates, other seed) | 374 | 374 | 374 | 0 | 0 | 0 of 676 |
| Published research collections, held out (SpamAssassin spam; genuine: SpamAssassin and Enron) | 3759 | 3491 | 3685 | 194 | 159 | 87 of 4072 |
| Spam check set (`eval-spam.jsonl`, hand-written, never trained on) | 23 | 19 | 19 | 0 | 0 | 0 of 7 |

Hand-written emails it got wrong: none.
Held-out real-world examples it missed (any variant): real:calcsic-fall-semester-scheduling, real:diocese-richmond-bishop-gmail-assistance, real:gmu-negative-feedback-dispute, real:k12-pcat-invoice-pay-today, real:mhc-bec-favor-laryngitis, real:moore-compromised-staff-account-estate-sale-ad, real:mrsc-hacked-vendor-asks-county-banking, real:pbA-sdsu-enable-mfa-qr-12h, real:pbB-ucla-macbook-ps5-giveaway, real:pcrisk-billing-issue-membership-suspended, real:uchicago-available-in-meeting, real:uthscsa-work-study-pdf, real:utwente-note-late-partner-collection.
Genuine look-alikes it called phishing: none.
Held-out published genuine emails it called phishing (any variant): real:msl-purview-dlp-item-conflicts-policy-genuine, real:rge-honey-paypal-rewards-points-genuine.

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
phishing (it measures missed phishing, not false alarms); it is small (variants of 318 published examples, mostly
aimed at universities); and its variants get the same random sender, layout and wording changes as the
training data. It was never trained on, and the generator was not changed to fit it, but its score was
seen between training runs (model 0.10.0, before 183 more examples from new sources were added: 549 of
564 on this set, and 484 of the 528 held-out genuine variants right). Held-out emails often come from
the same sources as trained ones (several emails from one payroll office or archive), so these scores
are somewhat optimistic. One training run's scores move with its random seed (by up to 24 of 243
genuine variants on 0.8.0's data), which is why this model averages several runs.

**Regression cases** (`training/regressions.jsonl`): emails earlier versions got wrong, reported
by the maintainer and paraphrased without personal data: genuine ones (a deal-site newsletter, a security
vendor's sales thread, an automated district reimbursement statement) and missed spam (a credit-card
offer in pictures, a fake cloud-storage notice, an IPTV offer); plus genuine look-alikes of that spam (a
store coupon in pictures, a bank's card offer, a real storage-full notice). The generator was extended
because of them, so they are a regression check, not an independent score. Real-world accuracy needs
real, labelled, de-identified examples (add them in `training/data/extra/`). English only. Advisory only
in the extension: it never clears a warning or moves email.
