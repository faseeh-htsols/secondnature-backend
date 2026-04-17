import { RequestHandler, Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma-client";

export const getTagById: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;

    const tag = await prisma.tag.findUnique({
      where: { id: Number(id) },
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
    });

    if (!tag) {
      res.status(404).json({
        messages: [{ type: "error", message: "Tag not found." }],
        data: null,
      });
      return;
    }

    res.status(200).json({
      messages: [{ type: "success", message: "Tag fetched successfully." }],
      data: { tag },
    });
  } catch (error) {
    console.error("Error fetching tag:", error);
    next(error);
  }
};

