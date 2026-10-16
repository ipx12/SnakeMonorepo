import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Interface representing Cloudflare environment bindings for SnakeMonorepo.
 */
interface CloudflareBindings {
  API?: {
    fetch: (input: string | Request, init?: RequestInit) => Promise<Response>;
  };
}

/**
 * Universal backend fetch dispatcher.
 * Leverages Cloudflare Service Bindings (env.API) when running on the Cloudflare Edge runtime
 * to invoke the Hono API worker directly in-memory, completely bypassing public internet
 * routing and Cloudflare Error 1003 (Direct IP access).
 * Transparently falls back to native fetch() in local Node.js development environments.
 *
 * @param targetUrl - The full target URL for the request
 * @param requestInit - Standard RequestInit options (method, headers, body, signal)
 * @returns Promise resolving to the upstream Response
 */
export async function dispatchApiRequest(
  targetUrl: string,
  requestInit: RequestInit = {}
): Promise<Response> {
  const parsedUrl = new URL(targetUrl);
  const isLocalhost =
    parsedUrl.hostname === 'localhost' ||
    parsedUrl.hostname === '127.0.0.1' ||
    parsedUrl.hostname === '::1';

  if (!isLocalhost) {
    try {
      const context = await getCloudflareContext({ async: true });
      const bindings = context?.env as CloudflareBindings | undefined;

      if (bindings?.API && typeof bindings.API.fetch === 'function') {
        const cleanHeaders = new Headers(requestInit.headers);
        cleanHeaders.set('host', parsedUrl.host);

        const bindingResponse = await bindings.API.fetch(targetUrl, {
          ...requestInit,
          headers: cleanHeaders,
        });

        // If local emulator returns 503 worker not found, fall back to native fetch
        if (bindingResponse.status !== 503) {
          return bindingResponse;
        }
      }
    } catch {
      // In local development or during static site generation, getCloudflareContext is unavailable
    }
  }

  // Fallback for local development
  return fetch(targetUrl, requestInit);
}
