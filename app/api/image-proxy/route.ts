import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  console.log('🖼️ Image proxy called with URL:', imageUrl);

  if (!imageUrl) {
    console.error('❌ No image URL provided');
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
  }

  try {
    console.log('🔄 Fetching image from:', imageUrl);
    
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RecipeApp/1.0)',
        'Accept': 'image/*',
      },
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('❌ Image fetch failed with status:', response.status);
      throw new Error(`Image fetch failed: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    console.log('✅ Image fetched successfully, size:', imageBuffer.byteLength, 'bytes');
    console.log('✅ Content type:', contentType);

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('❌ Image proxy error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 