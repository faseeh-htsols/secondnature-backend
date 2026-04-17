import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const updateCTAPosition = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const { sectionIndex } = req.body;

    if (sectionIndex === undefined || isNaN(Number(sectionIndex)) || Number(sectionIndex) < 0) {
      res.status(400).json({
        messages: [{ type: "error", message: "Please provide a valid section index (0 or greater)" }],
        data: null,
      });
      return;
    }

    // Check if the assignment exists
    const existing = await prisma.blogCTA.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      res.status(404).json({
        messages: [{ type: "error", message: "Blog-CTA assignment not found." }],
        data: null,
      });
      return;
    }

    // Update the section index
    const updated = await prisma.blogCTA.update({
      where: { id: Number(id) },
      data: {
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

    res.status(200).json({
      messages: [{ type: "success", message: "CTA position updated successfully." }],
      data: { blogCTA: updated },
    });
  } catch (error: any) {
    console.error("Error updating CTA position:", error);

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
      messages: [{ type: "error", message: "Could not update CTA position." }],
      data: null,
    });
  }
};

