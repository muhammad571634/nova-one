import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const PRESETS_DIR = 'C:\\Users\\joray\\.claude\\skills\\hyperframes-creative\\frame-presets';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  if (!id || id === 'auto' || id.includes('..') || id.includes('/') || id.includes('\\')) {
    return new NextResponse('Invalid preset ID', { status: 400 });
  }

  const showcasePath = path.join(PRESETS_DIR, id, 'frame-showcase.html');
  if (!fs.existsSync(showcasePath)) {
    return new NextResponse('Preset showcase not found', { status: 404 });
  }

  const html = fs.readFileSync(showcasePath, 'utf8');

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'SAMEORIGIN',
    },
  });
}