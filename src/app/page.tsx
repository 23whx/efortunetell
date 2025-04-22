import Image from "next/image";

import { Heart, Bookmark, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/button';

export default function Home() {
  const categories = ['八字', '大六壬', '奇门', '梅花易数', '风水', '面相'];
  
  const articles = [
    {
      id: 1,
      title: '八字命理入门指南',
      summary: '详细介绍八字命理的基本概念和入门知识，帮助初学者快速掌握。',
      author: '张大师',
      date: '2024-03-15',
      category: '八字',
      cover: '/next.svg',
      likes: 128,
      bookmarks: 56,
      comments: 24
    },
    {
      id: 2,
      title: '大六壬实战案例分析',
      summary: '通过实际案例展示大六壬预测的准确性和应用方法。',
      author: '李道长',
      date: '2024-03-10',
      category: '大六壬',
      cover: '/vercel.svg',
      likes: 95,
      bookmarks: 42,
      comments: 18
    },
    {
      id: 3,
      title: '奇门遁甲与现代决策',
      summary: '探讨如何将古老的奇门遁甲术应用于现代商业决策中。',
      author: '王教授',
      date: '2024-03-05',
      category: '奇门',
      cover: '/globe.svg',
      likes: 156,
      bookmarks: 78,
      comments: 32
    },
    {
      id: 4,
      title: '梅花易数快速断卦技巧',
      summary: '分享梅花易数中快速断卦的几个实用技巧和心得。',
      author: '赵老师',
      date: '2024-02-28',
      category: '梅花易数',
      cover: '/file.svg',
      likes: 87,
      bookmarks: 39,
      comments: 15
    }
  ];

  return (
    <div className="min-h-screen p-6 bg-[#FFFACD]">
      <h1 className="text-3xl font-bold mb-8 text-center">博客</h1>
      
      <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
        {categories.map((category) => (
          <Button 
            key={category}
            variant="outline"
            className={`shrink-0 border-[#FF6F61] text-[#FF6F61] hover:bg-[#FF6F61] hover:text-white ${category === '高亮' ? 'bg-[#FF6F61] text-white' : ''}`}
          >
            {category}
          </Button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {articles.map((article) => (
          <div 
            key={article.id}
            className="bg-[#FFFACD] rounded-lg shadow-lg overflow-hidden hover:shadow-primary/20 transition-shadow"
          >
            <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${article.cover})` }} />
            
            <div className="p-6">
              <span className="text-xs text-amber-500">{article.category}</span>
              <h2 className="text-xl font-semibold mt-1 mb-2">{article.title}</h2>
              <p className="text-muted-foreground text-sm mb-4">{article.summary}</p>
              
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{article.author} · {article.date}</span>
                
                <div className="flex gap-3">
                  <button className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{article.likes}</span>
                  </button>
                  <button className="flex items-center gap-1">
                    <Bookmark className="w-4 h-4" />
                    <span>{article.bookmarks}</span>
                  </button>
                  <button className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{article.comments}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
