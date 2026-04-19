import { RequestHandler, NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma-client";

export const getAllCTAs: RequestHandler = async (
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
        OR: [
          {
            heading: {
              contains: search,
            },
          },
          {
            paragraph: {
              contains: search,
            },
          },
          {
            buttonText: {
              contains: search,
            },
          },
        ],
      }
      : {};

    const [ctas, total] = await Promise.all([
      prisma.cTA.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          imageUrl: true,
          heading: true,
          paragraph: true,
          buttonText: true,
          buttonHref: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              blogCTAs: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.cTA.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      messages: [{ type: "success", message: "CTAs fetched successfully." }],
      data: {
        ctas,
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
    console.error("Error fetching CTAs:", error);
    next(error);
  }
};