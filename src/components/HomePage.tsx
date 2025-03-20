"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Article = {
  id: number;
  title: string;
  url: string;
  urlToImage?: string;
  description?: string;
  content?: string;
  createdAt: string;
};

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const res = await fetch('/api/get-news');
      const data = await res.json();
      setArticles(data);
    };

    fetchArticles();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">Știri recente</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link key={article.id} href={`/article/${article.id}`}>
            <div className="border rounded overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition">
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                {/* ✅ Afișăm doar titlul */}
                <h2 className="text-xl font-bold mb-2">
                  {article.title}
                </h2>
                <span className="text-blue-500 hover:underline">
                  Citește mai mult
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}