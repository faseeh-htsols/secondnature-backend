import { RequestHandler, NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma-client";

export const getAllCTAs: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ctas = await prisma.cTA.findMany({
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
    });

    res.status(200).json({
      messages: [{ type: "success", message: "CTAs fetched successfully." }],
      data: { ctas },
    });
  } catch (error) {
    console.error("Error fetching CTAs:", error);
    next(error);
  }
};

