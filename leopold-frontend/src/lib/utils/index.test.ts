/** @vitest-environment node */
import { describe, expect, test } from 'vitest';
import { sanitizeHtml } from './index';

describe('sanitizeHtml (SSR)', () => {
  test('falls back to encoding without document', () => {
    expect(typeof document).toBe('undefined');
    const html = '<script>"&"</script>';
    const sanitized = sanitizeHtml(html);
    expect(sanitized).toBe('&lt;script&gt;&quot;&amp;&quot;&lt;/script&gt;');
  });
});
