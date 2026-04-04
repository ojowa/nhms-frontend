import { buildClientHeaders, buildUpstreamHeaders } from './headers';
import { resolveApiTarget } from './targets';

const getRequestBody = async (request: Request): Promise<BodyInit | undefined> => {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return undefined;
  }

  const bodyText = await request.text();
  return bodyText.length > 0 ? bodyText : undefined;
};

const buildUpstreamUrl = (request: Request): URL => {
  const incomingUrl = new URL(request.url);
  const target = resolveApiTarget(incomingUrl.pathname);
  const upstreamUrl = new URL(`${target.origin}${target.upstreamPath}`);
  upstreamUrl.search = incomingUrl.search;
  return upstreamUrl;
};

export const proxyApiRequest = async (request: Request): Promise<Response> => {
  const upstreamUrl = buildUpstreamUrl(request);
  const response = await fetch(upstreamUrl, {
    method: request.method,
    headers: buildUpstreamHeaders(request.headers),
    body: await getRequestBody(request),
    redirect: 'manual',
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: buildClientHeaders(response.headers),
  });
};
