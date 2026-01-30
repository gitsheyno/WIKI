import { eq, isNull } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import summarizeArticle from "@/ai/summarize";
import redis from "@/cache";
import db from "@/db/index";
import { articles } from "@/db/schema";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      content: articles.content,
    })
    .from(articles)
    .where(isNull(articles.summary));

  let updatedet = 0;

  console.log("starting ai summary job");
  for (const row of rows) {
    try {
      const summary = await summarizeArticle(
        row.title || "",
        row.content || "",
      );
      if (summary && summary.length > 0) {
        await db
          .update(articles)
          .set({ summary })
          .where(eq(articles.id, row.id));
        updatedet++;
      }
    } catch (e) {
      console.log("Error summarizing article id ", row.id, e);
    }
  }

  if (updatedet > 0) {
    try {
      await redis.del("articles:all");
    } catch (err) {
      console.log("Error deleting cache for articles:all", err);
    }
  }

  console.log("AI summary job completed. Updated ", updatedet, " articles.");

  return NextResponse.json({ updated: updatedet, ok: true });
}
