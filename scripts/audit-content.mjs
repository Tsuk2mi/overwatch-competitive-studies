import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const files = fs.readdirSync('content/lessons').filter(f => f.endsWith('.md')).sort();
const numbers = new Set();
const slugs = new Set();
for (const file of files) {
  const text = fs.readFileSync(path.join('content/lessons', file), 'utf8');
  const [, metadata, body] = text.split(/^---\s*$/m);
  assert(metadata && body !== undefined, `${file}: frontmatter required`);
  const get = key => metadata.match(new RegExp(`^${key}: (.+)$`, 'm'))?.[1];
  const lesson = get('lesson');
  const slug = get('slug');
  assert(!numbers.has(lesson), `${file}: duplicate lesson number`);
  assert(!slugs.has(slug), `${file}: duplicate slug`);
  numbers.add(lesson); slugs.add(slug);
  assert(!/南京大学|NANJING|NJU|未经许可|内部赛训资料|【PDF 第|Lorem ipsum/i.test(text), `${file}: non-public source packaging remains`);
  assert(!/^# /m.test(body), `${file}: course title belongs in metadata, not body`);
  if (get('status') === 'published') {
    assert(get('contentState') === 'approved', `${file}: unapproved publication`);
    assert(body.length > 500, `${file}: published lesson has no full text`);
    assert(/^## /m.test(body), `${file}: no chapter structure`);
  } else {
    assert(body.trim() === '', `${file}: pending lessons must not publish working prose`);
  }
}
const published = files.filter(f => /^status: published$/m.test(fs.readFileSync(path.join('content/lessons', f), 'utf8'))).length;
console.log(`Content audit passed: ${files.length} lessons; ${published} published, ${files.length - published} pending.`);
