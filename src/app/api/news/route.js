import { getNews } from '@/lib/newsApi';

export async function GET(req) {
  const news = await getNews();

  return Response.json(news);
}