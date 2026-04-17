import prisma from "../../utils/prisma-client";
import { RequestHandler, Request, Response, NextFunction } from "express";

export const deleteTag: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;

    // 1. Check the tag exists
    const existing = await prisma.tag.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      res.status(404).json({
        messages: [{ type: "error", message: "Tag not found." }],
        data: null,
      });
      return;
    }

    // 2. Delete the tag record (cascade will remove BlogTag entries)
    await prisma.tag.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "Tag deleted successfully." }],
      data: null,
    });
  } catch (error) {
    console.error("Error deleting tag:", error);
    next(error);
  }
};

