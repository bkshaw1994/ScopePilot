import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  const memory = process.memoryUsage();

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    system: {
      heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
      rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
    },
    services: {
      geminiConfigured: Boolean(
        process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your-gemini')
      ),
      supabaseConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
      ),
    },
    latencyMs: Date.now() - startTime,
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
