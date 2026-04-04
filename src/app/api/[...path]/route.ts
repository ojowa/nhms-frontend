import { proxyApiRequest } from '@/server/api/proxyRequest';

export const dynamic = 'force-dynamic';

const forward = async (request: Request) => proxyApiRequest(request);

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
export const HEAD = forward;
export const OPTIONS = forward;
