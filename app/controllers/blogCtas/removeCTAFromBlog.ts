import prisma from "../../utils/prisma-client";
import { RequestHandler, Request, Response, NextFunction } from "express";

export const removeCTAFromBlog: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;

    // Check if the assignment exists
    const existing = await prisma.blogCTA.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      res.status(404).json({
        messages: [{ type: "error", message: "Blog-CTA assignment not found." }],
        data: null,
      });
      return;
    }

    // Delete the assignment
    await prisma.blogCTA.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "CTA removed from blog successfully." }],
      data: null,
    });
  } catch (error) {
    console.error("Error removing CTA from blog:", error);
    next(error);
  }
};

