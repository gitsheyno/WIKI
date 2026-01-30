"use server";

import redis from "@/cache";
import sendCelebrationEmail from "@/email/celebration-email";

const milestones = [10, 50, 100, 500, 1000, 5000, 10000];

const keyFor = (id: number) => `pageviews:article:${id}`;
export async function incremenetPageView(articleId: number) {
  const articleKey = keyFor(articleId);
  const newVal = await redis.incr(articleKey);

  if (milestones.includes(newVal)) {
    void sendCelebrationEmail(articleId, newVal);
  }
  return newVal;
}
