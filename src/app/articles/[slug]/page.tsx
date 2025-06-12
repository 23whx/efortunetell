import { notFound } from 'next/navigation';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Metadata } from 'next';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const filePath = join(process.cwd(), 'src', 'app', 'articles', `${slug}.mdx`);
    // 读取文件但不使用内容，只是检查文件是否存在
    readFileSync(filePath, 'utf8');
    
    return {
      title: `${slug} - 博客文章`,
      description: `这是关于${slug}的文章`,
    };
  } catch (_) {
    return {
      title: '文章不存在',
      description: '请浏览其他文章',
    };
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  try {
    const { slug } = await params;
    const filePath = join(process.cwd(), 'src', 'app', 'articles', `${slug}.mdx`);
    const fileContent = readFileSync(filePath, 'utf8');
    return (
      <article className="prose mx-auto max-w-4xl py-8">
        {fileContent}
      </article>
    );
  } catch (_) {
    return notFound();
  }
}