import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const createTag = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide a valid tag name" }],
      data: null,
    });
    return;
  }

  try {
    const newTag = await prisma.tag.create({
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

    res.status(201).json({
      messages: [{ type: "success", message: "Tag created successfully." }],
      data: { tag: newTag },
    });
  } catch (error: any) {
    console.error("Error creating tag:", error);

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
      messages: [{ type: "error", message: "Could not create tag." }],
      data: null,
    });
  }
};

