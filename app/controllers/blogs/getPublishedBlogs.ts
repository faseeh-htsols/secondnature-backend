import { RequestHandler, Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma-client";

export const getPublishedBlogs: RequestHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    const blogs = await prisma.blog.findMany({
      where: {
        isPublished: true, // ✅ Only published blogs
        scheduledDate: {
          // 👈 Use scheduledDate for filtering
          not: null,
          lte: now,
        },
      },
      orderBy: {
        scheduledDate: "desc", // 👈 Latest scheduled date first
      },
      include: {
        author: true,
      },
    });

    res.status(200).json({
      messages: [
        {
          type: "success",
          message:
            "Fetched all published blogs with full details (sorted by schedule date).",
        },
      ],
      data: { blogs },
    });
  } catch (error) {
    console.error("Error fetching published blog details:", error);
    next(error);
  }
};
