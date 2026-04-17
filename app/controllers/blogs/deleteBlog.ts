// src/controllers/blogs.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma-client";

export const deleteBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    // Check if the blog exists
    const blog = await prisma.blog.findUnique({
      where: { id: Number(id) },
    });

    if (!blog) {
      res.status(404).json({
        messages: [{ type: "error", message: "Blog not found." }],
        data: null,
      });
    }

    // Delete blog (cascades headings if defined in schema)
    await prisma.blog.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "Blog deleted successfully." }],
      data: null,
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    next(error);
  }
};
