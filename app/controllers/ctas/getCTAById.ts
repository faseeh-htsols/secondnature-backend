import { RequestHandler, Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma-client";

export const getCTAById: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;

    const cta = await prisma.cTA.findUnique({
      where: { id: Number(id) },
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
    });

    if (!cta) {
      res.status(404).json({
        messages: [{ type: "error", message: "CTA not found." }],
        data: null,
      });
      return;
    }

    res.status(200).json({
      messages: [{ type: "success", message: "CTA fetched successfully." }],
      data: { cta },
    });
  } catch (error) {
    console.error("Error fetching CTA:", error);
    next(error);
  }
};

