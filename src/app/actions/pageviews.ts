"use server";

import redis from "@/cache";

const keyFor = (id: number) => `pageviews:article:${id}`;
export async function incremenetPageView(articleId: number) {
  const articleKey = keyFor(articleId);
  const newVal = await redis.incr(articleKey);

  return +newVal;
}
