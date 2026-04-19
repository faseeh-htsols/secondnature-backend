import { RequestHandler, Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma-client";

export const getPublishedBlogs: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const now = new Date();

    const where = {
      isPublished: true,
      scheduledDate: {
        not: null,
        lte: now,
      },
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          scheduledDate: "desc",
        },
        select: {
          id: true,
          title: true,
          slug: true,
          pictureUrl: true,
          scheduledDate: true,
          author: {
            select: {
              name: true,
              pictureUrl: true,
            },
          },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      messages: [
        {
          type: "success",
          message: "Published blogs fetched successfully.",
        },
      ],
      data: {
        blogs,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching published blogs:", error);
    next(error);
  }
};