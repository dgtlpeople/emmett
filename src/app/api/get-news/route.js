import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching news from database:', error);
    return NextResponse.json({ error: 'Failed to fetch news from database' }, { status: 500 });
  }
}