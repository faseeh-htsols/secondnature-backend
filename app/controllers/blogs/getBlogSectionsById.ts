// src/controllers/blogs.ts
import { RequestHandler, Request, Response } from "express";
import prisma from "../../utils/prisma-client";
import { splitIntoSectionsNoIntro } from "../../utils/split-into-sections";

/**
 * GET /blogs/:id/sections
 * Returns ONLY processed sections for a published blog.
 */
export const getBlogSectionsById: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const blogId = Number(req.params.id);
    console.log(blogId);
    if (!blogId || Number.isNaN(blogId)) {
      res.status(400).json({
        messages: [{ type: "error", message: "Valid blog ID is required." }],
        data: null,
      });
      return;
    }

    const blog = await prisma.blog.findFirst({
      where: {
        id: blogId,
      },
      select: {
        id: true,
        contentHtml: true,
      },
    });

    if (!blog) {
      res.status(404).json({
        messages: [
          { type: "error", message: "Blog not found or unpublished." },
        ],
        data: null,
      });
      return;
    }

    const sections = blog.contentHtml
      ? splitIntoSectionsNoIntro(blog.contentHtml)
      : [];

    res.status(200).json({
      messages: [
        { type: "success", message: "Sections fetched successfully." },
      ],
      data: {
        blogId: blog.id,
        sections,
      },
    });
  } catch (error) {
    console.error("Error fetching blog sections by id:", error);
    res.status(500).json({
      messages: [{ type: "error", message: "Failed to fetch sections." }],
      data: null,
    });
  }
};
