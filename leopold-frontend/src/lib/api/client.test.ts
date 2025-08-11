import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$app/environment', () => ({ browser: false }));

describe('APIClient header handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not set Content-Type for GET requests', async () => {
    const { apiClient } = await import('./client');
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({})
      } as Response);

    await apiClient.getObservations();

    expect(fetchMock).toHaveBeenCalled();
    const [, options] = fetchMock.mock.calls[0];
    const headers = (options?.headers ?? {}) as Record<string, string>;
    const headerKeys = Object.keys(headers).map((h) => h.toLowerCase());
    expect(headerKeys).not.toContain('content-type');
  });

  it('does not override headers for file uploads', async () => {
    const { apiClient } = await import('./client');
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({})
      } as Response);

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    await apiClient.uploadImage(file);

    const [, options] = fetchMock.mock.calls[0];
    const headers = (options?.headers ?? {}) as Record<string, string>;
    const headerKeys = Object.keys(headers).map((h) => h.toLowerCase());
    expect(headerKeys).not.toContain('content-type');
    expect(options?.body).toBeInstanceOf(FormData);
  });
});

