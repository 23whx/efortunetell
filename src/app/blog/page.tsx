'use client';
import { useState } from 'react';
import Link from 'next/link'; // 别忘了引入 Link
import { Heart, Bookmark, MessageSquare } from "lucide-react";
import Button from '@/components/ui/button';

export default function BlogPage() {
  const categories = ["八字", "大六壬", "奇门", "梅花易数", "风水", "面相"];
  const [sortBy, setSortBy] = useState<'date' | 'likes' | 'bookmarks'>('date');

  const articles = [
    {
      id: 1,
      title: "八字命理入门指南",
      summary: "详细介绍八字命理的基本概念和入门知识，帮助初学者快速掌握。",
      author: "张大师",
      date: "2024-03-15",
      category: "八字",
      cover: "/next.svg",
      likes: 128,
      bookmarks: 56,
      comments: 24,
    },
    {
      id: 2,
      title: "大六壬实战案例分析",
      summary: "通过实际案例展示大六壬预测的准确性和应用方法。",
      author: "李道长",
      date: "2024-03-10",
      category: "大六壬",
      cover: "/vercel.svg",
      likes: 95,
      bookmarks: 42,
      comments: 18,
    },
    {
      id: 3,
      title: "奇门遁甲与现代决策",
      summary: "探讨如何将古老的奇门遁甲术应用于现代商业决策中。",
      author: "王教授",
      date: "2024-03-05",
      category: "奇门",
      cover: "/globe.svg",
      likes: 156,
      bookmarks: 78,
      comments: 32,
    },
    {
      id: 4,
      title: "梅花易数快速断卦技巧",
      summary: "分享梅花易数中快速断卦的几个实用技巧和心得。",
      author: "赵老师",
      date: "2024-02-28",
      category: "梅花易数",
      cover: "/file.svg",
      likes: 87,
      bookmarks: 39,
      comments: 15,
    },
  ];

  return (
    <div className="min-h-screen font-sans bg-[#FFFACD]">
      {/* Categories and Sort */}
      <div className="sticky top-0 z-10 bg-[#FFFACD] py-4 px-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
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
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'likes' | 'bookmarks')}
            className="bg-[#FFFACD] text-[#FF6F61] border border-[#FF6F61] rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#FF6F61] hover:bg-[#ffede3] transition-colors"
          >
            <option value="date">按时间排序</option>
            <option value="likes">按点赞排序</option>
            <option value="bookmarks">按收藏排序</option>
          </select>
        </div>
      </div>

      {/* Articles */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {articles
            .slice()
            .sort((a, b) => {
              if (sortBy === 'date') {
                return b.date.localeCompare(a.date);
              } else if (sortBy === 'likes') {
                return b.likes - a.likes;
              } else {
                return b.bookmarks - a.bookmarks;
              }
            })
            .map((article) => (
              <Link
                href={`/blog/${article.id}`}
                key={article.id}
                className="block bg-[#FFFACD] text-[hsl(0_0%_14.5%)] rounded-lg overflow-hidden hover:shadow-md hover:shadow-[#FF6F61]/20 transition-all duration-300 h-64 flex flex-col border border-[#FF6F61]"
              >
                <div
                  className="h-20 bg-cover bg-center"
                  style={{ backgroundImage: `url(${article.cover})` }}
                />
                <div className="p-4 flex flex-col flex-grow">
                  <span className="text-xs font-medium text-[#FF6F61]">{article.category}</span>
                  <h2 className="text-lg font-semibold mt-1 mb-2 line-clamp-2">{article.title}</h2>
                  <p className="text-[hsl(0_0%_55.6%)] text-sm mb-3 line-clamp-2 flex-grow">{article.summary}</p>

                  <div className="flex justify-between items-center text-xs text-[#FF6F61] mt-auto pt-2 border-t border-[#FF6F61]">
                    <span className="truncate mr-2">
                      {article.author} · {article.date}
                    </span>
                    <div className="flex gap-3 shrink-0">
                      <button className="flex items-center gap-1 hover:text-[#FF6F61] transition-colors">
                        <Heart className="w-3.5 h-3.5" />
                        <span>{article.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-[#FF6F61] transition-colors">
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{article.bookmarks}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-[#FF6F61] transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{article.comments}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>

            ))}
        </div>
      </div>
    </div>
  );
}
