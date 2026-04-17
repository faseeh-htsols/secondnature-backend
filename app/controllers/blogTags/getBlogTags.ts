import { RequestHandler, Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma-client";

export const getBlogTags: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blogId = req.params.blogId;

    if (!blogId || isNaN(Number(blogId))) {
      res.status(400).json({
        messages: [{ type: "error", message: "Please provide a valid blog ID" }],
        data: null,
      });
      return;
    }

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id: Number(blogId) },
    });

    if (!blog) {
      res.status(404).json({
        messages: [{ type: "error", message: "Blog not found." }],
        data: null,
      });
      return;
    }

    // Get all tags for this blog
    const blogTags = await prisma.blogTag.findMany({
      where: { blogId: Number(blogId) },
      include: {
        tag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "Blog tags fetched successfully." }],
      data: { blogTags },
    });
  } catch (error) {
    console.error("Error fetching blog tags:", error);
    next(error);
  }
};

