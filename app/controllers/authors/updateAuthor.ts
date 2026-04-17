import prisma from "../../utils/prisma-client";
import { Request, Response, NextFunction } from "express";
const fs = require("fs");
const path = require("path");
export const updateAuthor = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;
    const { name, bio } = req.body;

    // 1. Check the author exists
    const existing = await prisma.author.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      res.status(404).json({
        messages: [{ type: "error", message: "Author not found." }],
        data: null,
      });
      return;
    }

    // 2. Build the updated pictureUrl (if a new file was uploaded)
    let pictureUrl = existing.pictureUrl;
    if (req.file) {
      pictureUrl = `${process.env.ADMIN_APP_URI}/images/${req.file.filename}`;
    }

    // 3. Perform the update
    const updated = await prisma.author.update({
      where: { id: Number(id) },
      data: {
        // only overwrite if provided; otherwise keeps old values
        name: name ?? existing.name,
        bio: bio ?? existing.bio,
        pictureUrl,
      },
      select: {
        id: true,
        name: true,
        bio: true,
        pictureUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "Author updated successfully." }],
      data: { author: updated },
    });
  } catch (error: any) {
    console.error("Error updating author:", error);
    res.status(500).json({
      messages: [{ type: "error", message: "Could not update author." }],
      data: null,
    });
  }
};
