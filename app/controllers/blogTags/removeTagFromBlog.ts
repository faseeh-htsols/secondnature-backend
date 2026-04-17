import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const removeTagFromBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide a valid ID" }],
      data: null,
    });
    return;
  }

  try {
    // Check if the blog-tag assignment exists
    const blogTag = await prisma.blogTag.findUnique({
      where: { id: Number(id) },
    });

    if (!blogTag) {
      res.status(404).json({
        messages: [{ type: "error", message: "Blog-tag assignment not found." }],
        data: null,
      });
      return;
    }

    // Delete the assignment
    await prisma.blogTag.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "Tag removed from blog successfully." }],
      data: null,
    });
  } catch (error: any) {
    console.error("Error removing tag from blog:", error);
    res.status(500).json({
      messages: [{ type: "error", message: "Could not remove tag from blog." }],
      data: null,
    });
  }
};

