# Rules for AI assistants working in this repository

TinyPhishLLM is the **public** home of the released **phish-tiny** model, which the S.P.R.U.C.E+ browser
extension and S.P.R.U.C.E+ Mail Protection both download from here. It holds only the model, its input
format's code and made-up references. Everything used to make the model (training scripts, examples,
check sets, regression cases) is in **TinyPhishLLM_Private_Training**, which is private. README.md
explains the layout.

- **Only the model and made-up references go here.** Never add training scripts, examples (published or
  not), check sets, regression cases, a district's emails or anything from anyone's mailbox, and no real
  person's name, address, phone number, account or ID number or bank detail. `training/` is ignored here,
  and `node tools/check.js` fails if anything else is committed or if a reference holds anything but
  made-up cases.
- **The files come from TinyPhishLLM_Private_Training**, by its `node training/publish.js <this folder>`.
  Don't train, edit or replace the model or its references here; change them there and publish.
- **Before every commit:** `node tools/check.js` (all checks pass), and a `CHANGELOG.md` entry for a new
  model (its scores, no examples).
- **Never rewrite this repository's history** and never delete or move a commit on `main`: the programs
  download the model by the commit they pin (with each file's SHA-256), so a pinned commit must stay
  reachable. Keep the repository public: the programs download without a password.
- **Committing here releases nothing.** A model reaches people only when a program syncs it
  (`tools/sync-model.js` in each) and the maintainer (the repository owner) has tried that program's
  version and approved it in their own words, under that program's own rules (its CLAUDE.md). Never
  push a program's release branch or repository (`main` of the extension, `google_service_main`) from
  work done here.
