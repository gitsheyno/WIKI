"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import redis from "@/cache";
import { authorizeUserToEditArticle } from "@/db/authZ";
import db from "@/db/index";
import { articles } from "@/db/schema";
import { ensureUserExists } from "@/db/utilities";
import { stackServerApp } from "@/stack/server";

export type CreateArticleInput = {
  title: string;
  content: string;
  authorId: string;
  imageUrl?: string;
};

export type UpdateArticleInput = {
  title?: string;
  content?: string;
  imageUrl?: string;
};

export async function createArticle(data: CreateArticleInput) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  const response = await db.insert(articles).values({
    title: data.title,
    content: data.content,
    slug: "" + Date.now(),
    published: true,
    authorId: user.id,
    imageUrl: data.imageUrl ?? undefined,
  });

  redis.del("articles:all");

  return { success: true, message: "Article create logged (stub)" };
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  if (!(await authorizeUserToEditArticle(user.id, +id))) {
    throw new Error(
      "❌ Forbidden: You do not have permission to edit this article.",
    );
  }

  await ensureUserExists(user);

  const response = await db
    .update(articles)
    .set({
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl ?? undefined,
    })
    .where(eq(articles.id, +id));
  console.log("📝 updateArticle called:", { id, ...data });
  return { success: true, message: `Article ${id} update logged (stub)` };
}

export async function deleteArticle(id: string) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }
  await ensureUserExists(user);

  console.log("🗑️ deleteArticle called:", id);
  return { success: true, message: `Article ${id} delete logged (stub)` };
}

// Form-friendly server action: accepts FormData from a client form and calls deleteArticle
export async function deleteArticleForm(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (!id) {
    throw new Error("Missing article id");
  }

  await deleteArticle(String(id));
  // After deleting, redirect the user back to the homepage.
  redirect("/");
}
