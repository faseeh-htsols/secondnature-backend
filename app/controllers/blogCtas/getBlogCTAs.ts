import { RequestHandler, Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma-client";

export const getBlogCTAs: RequestHandler = async (
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

    // Get all CTAs for this blog, ordered by section index
    const blogCTAs = await prisma.blogCTA.findMany({
      where: { blogId: Number(blogId) },
      include: {
        cta: {
          select: {
            id: true,
            imageUrl: true,
            heading: true,
            paragraph: true,
            buttonText: true,
            buttonHref: true,
            isActive: true,
          },
        },
      },
      orderBy: { sectionIndex: "asc" },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "Blog CTAs fetched successfully." }],
      data: { blogCTAs },
    });
  } catch (error) {
    console.error("Error fetching blog CTAs:", error);
    next(error);
  }
};

