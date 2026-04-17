import { RequestHandler, Request, Response } from "express";
import prisma from "../../utils/prisma-client";
export const getAllBlogs: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
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

    res.status(200).json({
      messages: [{ type: "success", message: "Blogs fetched successfully." }],
      data: { blogs },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      messages: [{ type: "error", message: "Failed to fetch blogs." }],
      data: null,
    });
  }
};
