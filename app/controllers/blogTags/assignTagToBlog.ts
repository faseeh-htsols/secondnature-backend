import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const assignTagToBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { blogId, tagId } = req.body;

  // Validation
  if (!blogId || isNaN(Number(blogId))) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide a valid blog ID" }],
      data: null,
    });
    return;
  }

  if (!tagId || isNaN(Number(tagId))) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide a valid tag ID" }],
      data: null,
    });
    return;
  }

  try {
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

    // Check if tag exists
    const tag = await prisma.tag.findUnique({
      where: { id: Number(tagId) },
    });

    if (!tag) {
      res.status(404).json({
        messages: [{ type: "error", message: "Tag not found." }],
        data: null,
      });
      return;
    }

    // Create the assignment
    const blogTag = await prisma.blogTag.create({
      data: {
        blogId: Number(blogId),
        tagId: Number(tagId),
      },
      include: {
        tag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      messages: [{ type: "success", message: "Tag assigned to blog successfully." }],
      data: { blogTag },
    });
  } catch (error: any) {
    console.error("Error assigning tag to blog:", error);

    if (error.code === "P2002") {
      res.status(409).json({
        messages: [
          {
            type: "error",
            message: "This tag is already assigned to this blog.",
          },
        ],
        data: null,
      });
      return;
    }

    res.status(500).json({
      messages: [{ type: "error", message: "Could not assign tag to blog." }],
      data: null,
    });
  }
};

