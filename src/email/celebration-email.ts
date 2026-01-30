import { eq } from "drizzle-orm";
import db from "@/db";
import { articles, usersSync } from "@/db/schema";
import resend from "@/email";

export default async function sendCelebrationEmail(
  articleId: number,
  pageViews: number,
) {
  const response = await db
    .select({
      email: usersSync.email,
      id: usersSync.id,
    })
    .from(articles)
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id))
    .where(eq(articles.id, articleId));

  const { email, id } = response[0];

  if (!email) {
    console.log(
      `No email found for user with id ${articleId} on pageviews ${pageViews}`,
    );
    return;
  }

  // Custom Domain
  //   const emailRes = await resend.emails.send({
  //     from: "wiki <Domain>", -----> custom Domain
  //     to: email,
  //     subject: "🎉 Congratulations on Your Article's Milestone 🎉" + pageViews,
  //     html: `<h1>Congratulations people like you</h1>`,
  //   });

  const emailRes = await resend.emails.send({
    from: "wiki <onboarding@resend.dev>", // ------ > Resend Domain
    to: "hdrydeveloper@gmail.com", // ------> signed in Email
    subject: `🎉 Congratulations on Your Article's Milestone 🎉  ${pageViews}`,
    html: `<h1>Congratulations people like you</h1>`,
  });

  if (emailRes.error) {
    console.log(
      `Error sending email to user with id ${id} on pageviews ${pageViews}: ${emailRes.error.message}`,
    );
  } else {
    console.log(
      `Celebration email sent to user with id ${id} on pageviews ${pageViews}`,
    );
  }
}
