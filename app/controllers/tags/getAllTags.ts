import { RequestHandler, NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma-client";

export const getAllTags: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  const search = String(req.query.search || "").trim();

  const skip = (page - 1) * limit;

  try {
    const where = search
      ? {
        name: {
          contains: search,
        },
      }
      : {};

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              blogTags: true,
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.tag.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      messages: [{ type: "success", message: "Tags fetched successfully." }],
      data: {
        tags,
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
  } catch (error) {
    console.error("Error fetching tags:", error);
    next(error);
  }
};