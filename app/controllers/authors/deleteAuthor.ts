// src/controllers/authors.ts
import prisma from "../../utils/prisma-client";
import { RequestHandler, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const deleteAuthor: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;

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

    // 2. Optionally delete the image file from disk
    const imagePath = path.join(
      __dirname,
      "../../images",
      path.basename(existing.pictureUrl)
    );
    fs.unlink(imagePath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.warn("Failed to delete image file:", err);
      }
    });

    // 3. Delete the author record
    await prisma.author.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "Author deleted successfully." }],
      data: null,
    });
  } catch (error) {
    console.error("Error deleting author:", error);
    next(error);
  }
};
