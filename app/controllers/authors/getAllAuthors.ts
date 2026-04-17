// src/controllers/authors.ts
import { RequestHandler, NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma-client";

export const getAllAuthors: RequestHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authors = await prisma.author.findMany({
      select: {
        id: true,
        name: true,
        bio: true,
        pictureUrl: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({
      messages: [{ type: "success", message: "Authors fetched successfully." }],
      data: { authors },
    });
  } catch (error) {
    console.error("Error fetching authors:", error);
    next(error);
  }
};
