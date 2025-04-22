import { notFound } from 'next/navigation';
import { readFileSync } from 'fs';
import { join } from 'path';

export default function ArticlePage({ params }: { params: { slug: string } }) {
  try {
    const filePath = join(process.cwd(), 'src', 'app', 'articles', `${params.slug}.mdx`);
    const fileContent = readFileSync(filePath, 'utf8');
    return (
      <article className="prose mx-auto max-w-4xl py-8">
        {fileContent}
      </article>
    );
  } catch (e) {
    return notFound();
  }
}