"use client";
import { useEffect, useState } from 'react';

export default function NewsList() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      const res = await fetch('/api/news');
      const data = await res.json();
      setArticles(data);
    };

    fetchNews();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Latest News</h2>
      <ul>
        {articles.map((article, index) => (
          <li key={index} className="mb-4">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <h3 className="text-xl font-semibold">{article.title}</h3>
              {article.urlToImage && (
                <img src={article.urlToImage} alt={article.title} className="mt-2 w-full h-48 object-cover rounded" />
              )}
              <p className="text-gray-600">{article.description}</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}