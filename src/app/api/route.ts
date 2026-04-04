import { NextResponse } from 'next/server';
import { backendOrigin } from '@/server/api/constants';

export const dynamic = 'force-dynamic';

export const GET = async () =>
  NextResponse.json({
    ok: true,
    service: 'nhms-next-api-gateway',
    upstreams: {
      backend: backendOrigin,
    },
  });
