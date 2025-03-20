import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Props = {
  params: Promise<{
    id?: string;
  }>;
};

// ✅ Forțăm Next.js să genereze corect rutele dinamice
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

// ✅ Await explicit pentru `params`
export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  console.log('✅ Metadata params:', resolvedParams);

  return {
    title: `Articol - ${resolvedParams.id}`,
  };
}

export default async function ArticlePage({ params }: Props) {
  const resolvedParams = await params;
  console.log('✅ Received params:', resolvedParams); // LOG 1: Verificare params

  const rawId = resolvedParams?.id;
  console.log('✅ Raw id:', rawId); // LOG 2: Verificare id brut

  const id = rawId ? parseInt(decodeURIComponent(rawId)) : NaN;
  console.log('✅ Parsed id:', id); // LOG 3: Verificare dacă id-ul este valid

  if (isNaN(id)) {
    console.error('❌ Invalid id:', rawId);
    notFound();
  }

  try {
    const article = await prisma.article.findUnique({
      where: {
        id,
      },
    });

    console.log('✅ Found article:', article);

    if (!article) {
      console.error('❌ Article not found for id:', id);
      notFound();
    }

    let fullContent = article.content;

    if (!fullContent) {
      console.log('⚠️ Generating content with OpenAI for id:', id);

      const prompt = `Scrie un articol detaliat în limba română pe baza următoarelor informații:\n\nTitlu: ${article.title}\n\nDescriere: ${article.description || ''}`;

      try {
        const completion = await openai.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-3.5-turbo',
        });

        fullContent = completion.choices[0]?.message?.content || '';
        console.log('✅ OpenAI generated content:', fullContent);

        await prisma.article.update({
          where: { id },
          data: { content: fullContent },
        });
      } catch (error) {
        console.error('❌ OpenAI generation failed:', error);
      }
    }

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

        {article.urlToImage && (
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-64 object-cover mb-4"
          />
        )}

        <p className="text-gray-600 mb-2">{article.description}</p>

        <div className="prose max-w-full">
          {fullContent.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline block mt-4"
        >
          Citește articolul original
        </a>
      </div>
    );
  } catch (error) {
    console.error('❌ Prisma query failed:', error);
    notFound();
  }
}