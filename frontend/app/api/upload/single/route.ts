import { NextRequest, NextResponse } from 'next/server';

// Build API base from env and ensure it ends with /api
function ensureApiBase(url?: string | null) {
  const raw = (url || 'http://localhost:9000').trim();
  let base = raw.replace(/\/+$/, '');
  if (!base.endsWith('/api')) base = `${base}/api`;
  return base;
}
const API_BASE_URL = ensureApiBase(process.env.NEXT_PUBLIC_API_URL || null);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const url = `${API_BASE_URL}/upload/single`;

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Upload API error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}