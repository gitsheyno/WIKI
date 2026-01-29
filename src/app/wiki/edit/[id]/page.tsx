import WikiEditor from "@/components//wiki/wiki-editor";
import { getArticleById } from "@/lib/data/articles";
import { stackServerApp } from "@/stack/server";
import { notFound } from "next/navigation";
interface EditArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  await stackServerApp.getUser({ or: "redirect" });
  const { id } = await params;

  // In a real app, you would fetch the article data here
  // For now, we'll just show some mock data if it's not "new"

  const article = await getArticleById(+id);
  if (!article) {
    notFound();
  }

  return (
    <WikiEditor
      initialTitle={article.title}
      initialContent={article.content}
      isEditing={true}
      articleId={id}
    />
  );
}
