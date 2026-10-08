import { afterEach, describe, expect, it, vi } from 'vitest';

import { request } from './client';
import { GreenApiError } from './errors';

function mockFetch(implementation: typeof fetch) {
  vi.stubGlobal('fetch', vi.fn(implementation));
}

afterEach(() => vi.unstubAllGlobals());

describe('request', () => {
  it('parses JSON and treats an empty body as null', async () => {
    mockFetch(async () => new Response('{"idMessage":"M1"}'));
    await expect(request('https://api')).resolves.toEqual({ idMessage: 'M1' });

    mockFetch(async () => new Response('null'));
    await expect(request('https://api')).resolves.toBeNull();
  });

  it('never exposes the server error body, which contains the token', async () => {
    mockFetch(async () => new Response('Forbidden: /waInstance1/sendMessage/SECRET', { status: 403 }));
    const error = await request('https://api').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(GreenApiError);
    expect((error as GreenApiError).status).toBe(403);
    expect((error as GreenApiError).message).not.toContain('SECRET');
  });

  it('turns a network failure into a GreenApiError', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(request('https://api')).rejects.toMatchObject({ status: 0 });
  });

  it('fails with a timeout when the server does not answer', async () => {
    mockFetch(
      (_url, init) =>
        new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal?.reason))),
    );
    await expect(request('https://api', { timeoutMs: 10 })).rejects.toMatchObject({
      status: 0,
      message: 'Сервер GREEN-API не отвечает',
    });
  });

  it('rethrows the abort of the caller instead of reporting an error', async () => {
    mockFetch(
      (_url, init) =>
        new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal?.reason))),
    );
    const controller = new AbortController();
    const pending = request('https://api', { signal: controller.signal });
    controller.abort();

    await expect(pending).rejects.toHaveProperty('name', 'AbortError');
  });
});
