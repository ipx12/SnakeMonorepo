import { NextRequest, NextResponse } from 'next/server';

const internalApiUrl = process.env.INTERNAL_API_URL || 'http://localhost:3001';

/**
 * Universal reverse proxy route handler for API requests.
 * Proxies /api/* requests from the frontend origin to the backend Hono API,
 * ensuring cookies (session tokens) are stored on the same first-party domain
 * and preventing cross-origin cookie drops on Cloudflare Workers.
 */
async function proxyApiRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathString = resolvedParams.path.join('/');
  const requestUrl = new URL(request.url);
  const targetUrl = `${internalApiUrl}/api/${pathString}${requestUrl.search}`;

  const forwardHeaders = new Headers();
  request.headers.forEach((headerValue, headerKey) => {
    // Exclude host header to prevent Cloudflare edge routing poisoning
    if (headerKey.toLowerCase() !== 'host') {
      forwardHeaders.set(headerKey, headerValue);
    }
  });

  // Ensure origin is set for Better Auth CSRF verification
  if (!forwardHeaders.has('origin') || forwardHeaders.get('origin')?.startsWith('http://')) {
    forwardHeaders.set('origin', requestUrl.origin);
  }

  let requestBody: ArrayBuffer | undefined = undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const rawBodyBuffer = await request.arrayBuffer();
    if (rawBodyBuffer.byteLength > 0) {
      requestBody = rawBodyBuffer;
    }
  }

  try {
    const apiResponse = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body: requestBody,
      redirect: 'manual',
    });

    const responseHeaders = new Headers();
    apiResponse.headers.forEach((value, key) => {
      responseHeaders.append(key, value);
    });

    return new NextResponse(apiResponse.body, {
      status: apiResponse.status,
      statusText: apiResponse.statusText,
      headers: responseHeaders,
    });
  } catch (proxyError: unknown) {
    console.error(`[API Proxy Error] Failed to proxy request to ${targetUrl}:`, proxyError);
    return NextResponse.json(
      { message: 'Failed to communicate with backend API' },
      { status: 502 }
    );
  }
}

export const GET = proxyApiRequest;
export const POST = proxyApiRequest;
export const PUT = proxyApiRequest;
export const PATCH = proxyApiRequest;
export const DELETE = proxyApiRequest;
export const HEAD = proxyApiRequest;
export const OPTIONS = proxyApiRequest;
