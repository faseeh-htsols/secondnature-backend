// src/schedulers/blogScheduler.ts
import cron from "node-cron";
import prisma from "../utils/prisma-client";

export const startBlogScheduler = () => {
  cron.schedule("*/5 * * * *", async () => {
    const now = new Date();
    await prisma.blog.updateMany({
      where: {
        isPublished: false,
        shouldAutoPublish: true, // ✅ only auto-publish if allowed
        scheduledDate: {
          lte: now,
        },
      },
      data: {
        isPublished: true,
        publishedDate: now,
      },
    });

    console.log("✅ Auto-published scheduled blogs at", now);
  });
};
