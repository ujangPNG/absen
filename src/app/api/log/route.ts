import { NextResponse } from 'next/server';
import { appendFile } from 'fs/promises';
import path from 'path';
export const runtime = 'nodejs';

export async function POST(request: Request) {
try {
    const body = await request.json();
    const logLine = `[${new Date().toISOString()}] ${body.message}\n`;

    const logPath = path.join(process.cwd(), 'logs', 'bot.log');
    await appendFile(logPath, logLine, 'utf8');
    return NextResponse.json({ status: 'ok' });
    
} catch (err) {
        console.error('Log write failed:', err);
        return NextResponse.json({ status: 'error', error: err }, { status: 500 });
    }
}
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}