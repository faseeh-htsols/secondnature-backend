import { RequestHandler, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../../utils/prisma-client";

export const getAllBlogs: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = 10;
  const search = String(req.query.search || "").trim();
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.BlogWhereInput = search
      ? {
        slug: {
          contains: search,
        },
      }
      : {};

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          slug: true,
          pictureUrl: true,
          isPublished: true,
        },
      }),
      prisma.blog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      messages: [{ type: "success", message: "Blogs fetched successfully." }],
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
        filters: {
          search,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching blogs:", error);

    res.status(500).json({
      messages: [{ type: "error", message: "Failed to fetch blogs." }],
      data: null,
    });
  }
};