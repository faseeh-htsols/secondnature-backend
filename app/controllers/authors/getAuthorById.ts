import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const getAuthorById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const author = await prisma.author.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        bio: true,
        pictureUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!author) {
      res.status(404).json({
        messages: [{ type: "error", message: "Author not found." }],
        data: null,
      });
      return;
    }

    res.status(200).json({
      messages: [{ type: "success", message: "Author fetched successfully." }],
      data: { author },
    });
  } catch (error) {
    console.error("Error fetching author:", error);
    res.status(500).json({
      messages: [{ type: "error", message: "Could not fetch author." }],
      data: null,
    });
  }
};
