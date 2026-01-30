// replace everything but the getArticlesById function - we'll do that in a sec

import { eq } from "drizzle-orm";
import redis from "@/cache";
import db from "@/db/index";
import { articles, usersSync } from "@/db/schema";

export type ArticleList = {
  id: number;
  title: string;
  createdAt: string;
  content: string;
  author: string | null;
  imageUrl: string | null;
  summary: string | null;
};

export async function getArticles(): Promise<ArticleList[]> {
  const cached = (await redis.get("articles:all")) as ArticleList[];

  if (cached) {
    console.log("Get articles Cached Hit");
    return cached;
  }

  console.log("Get articles Cached Miss");

  const response = await db
    .select({
      title: articles.title,
      id: articles.id,
      createdAt: articles.createdAt,
      content: articles.content,
      author: usersSync.name,
      summary: articles.summary,
    })
    .from(articles)
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id));

  await redis.set("articles:all", response, {
    ex: 60,
  });
  return response as ArticleList[];
}

export async function getArticleById(id: number) {
  const response = await db
    .select({
      title: articles.title,
      id: articles.id,
      createdAt: articles.createdAt,
      content: articles.content,
      author: usersSync.name,
      imageUrl: articles.imageUrl,
    })
    .from(articles)
    .where(eq(articles.id, id))
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id));
  return response[0] ? response[0] : null;
}
