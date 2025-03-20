import { NextResponse } from 'next/server';
import { fetchAndRewriteNews } from '@/lib/newsService';

export async function GET() {
  try {
    await fetchAndRewriteNews();
    return NextResponse.json({ message: 'News fetched and rewritten successfully' });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}