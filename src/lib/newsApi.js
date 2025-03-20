"use server";

import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2/top-headlines';

export const getNews = async (country = 'us', category = 'technology') => {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        country,
        category,
        apiKey: NEWS_API_KEY,
      },
    });

    const articles = response.data.articles;

    for (const article of articles) {
      if (!article.title || !article.content) continue;

      // Rewrite prompt to include title and description
      const prompt = `Rescrie următorul articol în limba română, inclusiv titlul și descrierea:\n\nTitlu: ${article.title}\n\nDescriere: ${article.description || ''}\n\nConținut: ${article.content || ''}`;

      try {
        const completion = await openai.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-3.5-turbo',
        });

        const rewrittenContent = completion.choices[0]?.message?.content || null;

        if (rewrittenContent) {
          const parts = rewrittenContent.split('\n\n');
          const newTitle = parts[0]?.replace('Titlu: ', '') || article.title;
          const newDescription = parts[1]?.replace('Descriere: ', '') || article.description;
          const newContent = parts.slice(2).join('\n\n') || article.content;

          console.log("Saving article:", {
            title: newTitle,
            url: article.url,
            urlToImage: article.urlToImage,
            description: newDescription,
            content: newContent,
          });

          const existingArticle = await prisma.article.findFirst({
            where: { url: article.url },
          });

          if (!existingArticle) {
            await prisma.article.create({
              data: {
                title: newTitle,
                url: article.url,
                urlToImage: article.urlToImage || null,
                description: newDescription,
                content: newContent,
              },
            });
          }
        }
      } catch (aiError) {
        console.error('AI rewrite failed:', aiError);
      }
    }

    return articles;
  } catch (error) {
    console.error('Error fetching or rewriting news:', error);
    return [];
  }
};