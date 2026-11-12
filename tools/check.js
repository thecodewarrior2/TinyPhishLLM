#!/usr/bin/env node
'use strict';
// tools/check.js — checks TinyPhishLLM before a commit (and the programs' sync tools run it before they
// take the model):
//
//     node tools/check.js            exits 1 on any problem
//
//   1. The model's files are whole and agree: model.json's tensors fit model.bin; vocab.txt has the
//      vocabulary size; model.onnx is there; the model card, the ONNX reference and model.json name the
//      same version.
//   2. The input format (tools/model-input.js) still builds exactly the texts in
//      model/reference/input-format.jsonl. That file is what the programs test their own copy of the
//      format against, so it changes only with a new model.
//   3. This repository is public and holds only the model: no training/ folder, no examples, and the
//      references are made up (input-format.jsonl only "made-up:" and "edge:" cases; ai-vectors.json only
//      their texts). The training, its examples and its check sets are in TinyPhishLLM_Private_Training (private).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { modelInputText } = require('./model-input.js');

const ROOT = path.resolve(__dirname, '..');
const MODEL = path.join(ROOT, 'model', 'phish-tiny');
const REF = path.join(ROOT, 'model', 'reference');
const problems = [];
const say = (ok, what) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) problems.push(what); };
const jsonl = (f) => fs.readFileSync(f, 'utf8').split('\n').filter(l => l.trim()).map(l => JSON.parse(l));

// --- 1. The model's files -----------------------------------------------------------------------------------
const manifest = JSON.parse(fs.readFileSync(path.join(MODEL, 'model.json'), 'utf8'));
const bin = fs.statSync(path.join(MODEL, 'model.bin')).size;
const end = Math.max(...manifest.tensors.map(t => {
    const n = t.shape.reduce((a, b) => a * b, 1);
    return t.dtype === 'i8' ? Math.max(t.offset + n, t.scales + 4 * t.shape[0]) : t.offset + 4 * n;
}));
say(end <= bin && bin - end < 4, `model.bin holds model.json's ${manifest.tensors.length} tensors (${bin} bytes)`);
const vocab = fs.readFileSync(path.join(MODEL, 'vocab.txt'), 'utf8').split('\n').filter((l, i, a) => i < a.length - 1 || l);
say(vocab.length === manifest.config.vocab, `vocab.txt has ${vocab.length} tokens (model.json: ${manifest.config.vocab})`);
say(fs.existsSync(path.join(MODEL, 'model.onnx')) && fs.statSync(path.join(MODEL, 'model.onnx')).size > 1e6, 'model.onnx is there');
const card = fs.readFileSync(path.join(MODEL, 'MODEL_CARD.md'), 'utf8').split('\n')[0];
say(card.startsWith(`# phish-tiny ${manifest.version}`), `MODEL_CARD.md is for ${manifest.version} (${card})`);
const onnxRef = JSON.parse(fs.readFileSync(path.join(REF, 'model-reference.json'), 'utf8'));
say(onnxRef.model === manifest.version, `model-reference.json is for ${manifest.version} (it says ${onnxRef.model})`);
const vec = JSON.parse(fs.readFileSync(path.join(REF, 'ai-vectors.json'), 'utf8'));
say(Array.isArray(vec) && vec.length > 0 && vec.every(v => v.ids.length <= manifest.config.maxLen && v.logits.length === 2), `ai-vectors.json has ${vec.length} texts`);

// --- 2. The input format ------------------------------------------------------------------------------------
const ref = jsonl(path.join(REF, 'input-format.jsonl'));
const changed = ref.filter(r => modelInputText(r.facts) !== r.text).map(r => r.name);
say(ref.length > 50 && !changed.length, `tools/model-input.js builds the ${ref.length} reference texts${changed.length ? `; different: ${changed.slice(0, 5).join(', ')}` : ''}`);

// --- 3. Only the model, and made-up references --------------------------------------------------------------
const UNICODE_SAMPLE = 'Café résumé naïve — "quoted" text, URLs like https://ex-ample.com/a?b=1 & emoji \u{1F600} and 中文!';
say(ref.every(r => /^(made-up|edge):/.test(r.name)), 'input-format.jsonl has only made-up cases (made-up:, edge:)');
const madeUp = new Set(ref.map(r => r.text));
say(vec.every(v => madeUp.has(v.text) || v.text === UNICODE_SAMPLE), 'ai-vectors.json has only made-up texts');
let tracked = [];
try { tracked = execFileSync('git', ['ls-files'], { cwd: ROOT }).toString().split('\n').filter(Boolean); } catch (e) { /* not a git checkout */ }
const notHere = tracked.filter(f => !/^(model\/phish-tiny\/|model\/reference\/(model-reference\.json|ai-vectors\.json|input-format\.jsonl)$|tools\/(check|model-input)\.js$|(README|CLAUDE|CHANGELOG)\.md$|\.gitignore$)/.test(f));
say(!notHere.length, `only the model, its references and tools are committed${notHere.length ? ` (also: ${notHere.join(', ')})` : ''}`);

if (problems.length) { console.log(`\n${problems.length} problem(s).`); process.exit(1); }
console.log('\nAll checks passed.');
