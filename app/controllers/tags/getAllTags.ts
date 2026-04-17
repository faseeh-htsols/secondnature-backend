import { RequestHandler, NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma-client";

export const getAllTags: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tags = await prisma.tag.findMany({
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
    });

    res.status(200).json({
      messages: [{ type: "success", message: "Tags fetched successfully." }],
      data: { tags },
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    next(error);
  }
};

