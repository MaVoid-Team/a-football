const fs = require('fs');
const path = require('path');

const roots = ['app', 'components'];
const exts = new Set(['.tsx', '.ts']);
const ignoreDirs = new Set(['node_modules', '.next', '.git']);

const files = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoreDirs.has(entry.name)) walk(fullPath);
      continue;
    }
    if (exts.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
}

for (const root of roots) walk(root);

const patterns = [
  { kind: 'text-node', regex: />\s*([A-Za-z][^<\n]{1,})\s*</g },
  {
    kind: 'jsx-prop',
    regex: /(?:placeholder|title|aria-label|alt|label|description)\s*=\s*"([A-Za-z][^"]{1,})"/g,
  },
  {
    kind: 'jsx-prop',
    regex: /(?:placeholder|title|aria-label|alt|label|description)\s*=\s*'([A-Za-z][^']{1,})'/g,
  },
];

const excludedTokens = [
  'http://',
  'https://',
  '/api/',
  'data-testid',
  'className',
  'variant',
  'type=',
  'size=',
  'target=',
  'rel=',
  'import ',
  'from ',
  'export ',
];

const findings = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split(/\r?\n/);

  lines.forEach((line, index) => {
    const lineNo = index + 1;
    const trimmed = line.trim();

    if (!trimmed) return;
    if (trimmed.startsWith('//')) return;
    if (trimmed.startsWith('*')) return;
    if (trimmed.startsWith('import ') || trimmed.startsWith('export ')) return;

    for (const { kind, regex } of patterns) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(line)) !== null) {
        const text = (match[1] || '').trim();

        if (!text) continue;
        if (/[{}$]/.test(text)) continue;
        if (/^[A-Z0-9_\-]+$/.test(text)) continue;
        if (/^[a-z0-9_\-]+$/.test(text)) continue;
        if (excludedTokens.some((t) => text.includes(t))) continue;
        if (/^(use[A-Z]|set[A-Z]|on[A-Z]|is[A-Z]|has[A-Z])/.test(text)) continue;

        findings.push({ file, line: lineNo, kind, text });
      }
    }
  });
}

const dedup = [];
const seen = new Set();

for (const f of findings) {
  const key = `${f.file}:${f.line}:${f.text}`;
  if (seen.has(key)) continue;
  seen.add(key);
  dedup.push(f);
}

dedup.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

for (const item of dedup) {
  console.log(`${item.file}:${item.line} | ${item.text}`);
}

console.error(`TOTAL_FINDINGS=${dedup.length}`);
