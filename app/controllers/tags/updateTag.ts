import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const updateTag = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      res.status(400).json({
        messages: [{ type: "error", message: "Please provide a valid tag name" }],
        data: null,
      });
      return;
    }

    // 1. Check the tag exists
    const existing = await prisma.tag.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      res.status(404).json({
        messages: [{ type: "error", message: "Tag not found." }],
        data: null,
      });
      return;
    }

    // 2. Perform the update
    const updated = await prisma.tag.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "Tag updated successfully." }],
      data: { tag: updated },
    });
  } catch (error: any) {
    console.error("Error updating tag:", error);

    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      res.status(409).json({
        messages: [
          {
            type: "error",
            message: "A tag with that name already exists.",
          },
        ],
        data: null,
      });
      return;
    }

    res.status(500).json({
      messages: [{ type: "error", message: "Could not update tag." }],
      data: null,
    });
  }
};

