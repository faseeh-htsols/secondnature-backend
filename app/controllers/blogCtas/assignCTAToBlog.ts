import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const assignCTAToBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { blogId, ctaId, sectionIndex } = req.body;

  // Validation
  if (!blogId || isNaN(Number(blogId))) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide a valid blog ID" }],
      data: null,
    });
    return;
  }

  if (!ctaId || isNaN(Number(ctaId))) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide a valid CTA ID" }],
      data: null,
    });
    return;
  }

  if (sectionIndex === undefined || isNaN(Number(sectionIndex)) || Number(sectionIndex) < 0) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide a valid section index (0 or greater)" }],
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

    // Check if CTA exists
    const cta = await prisma.cTA.findUnique({
      where: { id: Number(ctaId) },
    });

    if (!cta) {
      res.status(404).json({
        messages: [{ type: "error", message: "CTA not found." }],
        data: null,
      });
      return;
    }

    // Create the assignment
    const blogCTA = await prisma.blogCTA.create({
      data: {
        blogId: Number(blogId),
        ctaId: Number(ctaId),
        sectionIndex: Number(sectionIndex),
      },
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
    });

    res.status(201).json({
      messages: [{ type: "success", message: "CTA assigned to blog successfully." }],
      data: { blogCTA },
    });
  } catch (error: any) {
    console.error("Error assigning CTA to blog:", error);

    if (error.code === "P2002") {
      res.status(409).json({
        messages: [
          {
            type: "error",
            message: "This CTA is already assigned to this blog at this section.",
          },
        ],
        data: null,
      });
      return;
    }

    res.status(500).json({
      messages: [{ type: "error", message: "Could not assign CTA to blog." }],
      data: null,
    });
  }
};

