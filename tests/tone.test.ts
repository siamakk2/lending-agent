import { test } from 'node:test';
import assert from 'node:assert/strict';

// Same logic as lib/agent.ts splitTone (agent.ts pulls in the SDK, so the pure function is mirrored here).
function splitTone(text: string) {
  const m = text.match(/^\s*\[tone:(calm|warm|reassuring|upbeat)\]\s*/i);
  const tone = (m?.[1]?.toLowerCase()) || 'warm';
  return { reply: text.replace(/\[tone:[a-z]+\]\s*/gi, '').trim(), tone };
}

test('reads the tone tag and strips it', () => {
  assert.deepEqual(splitTone('[tone:reassuring] I hear you. Let’s take this one step at a time.'), { reply: 'I hear you. Let’s take this one step at a time.', tone: 'reassuring' });
});
test('defaults to warm when there is no tag', () => {
  assert.equal(splitTone('Hello there').tone, 'warm');
});
test('never leaks a stray tag into the reply', () => {
  assert.equal(splitTone('Sure.\n[tone:calm] More').reply.includes('[tone'), false);
});
