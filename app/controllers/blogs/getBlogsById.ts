// src/controllers/blogs.ts
import { RequestHandler, Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma-client";

export const getBlogById: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        messages: [{ type: "error", message: "Invalid blog ID." }],
        data: null,
      });
      return;
    }

    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        author: true,
        blogCTAs: {
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
          orderBy: {
            sectionIndex: "asc",
          },
        },
      },
    });

    if (!blog) {
      res.status(404).json({
        messages: [{ type: "error", message: "Blog not found." }],
        data: null,
      });
      return;
    }

    res.status(200).json({
      messages: [{ type: "success", message: "Blog fetched successfully." }],
      data: { blog },
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    next(error);
  }
};
