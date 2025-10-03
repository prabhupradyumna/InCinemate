import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/superadmin/tenants${queryString ? `?${queryString}` : ''}`;

    // Forward authorization header and cookies
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Tenants API error:', { status: response.status, data });
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = `${API_BASE_URL}/superadmin/tenants`;

    // Forward authorization header and cookies
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Tenant creation API error:', { status: response.status, data });
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tenant' },
      { status: 500 }
    );
  }
}