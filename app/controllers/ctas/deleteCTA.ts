import prisma from "../../utils/prisma-client";
import { RequestHandler, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

export const deleteCTA: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;

    // 1. Check the CTA exists
    const existing = await prisma.cTA.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      res.status(404).json({
        messages: [{ type: "error", message: "CTA not found." }],
        data: null,
      });
      return;
    }

    // 2. Delete the image file from disk IF present
    if (existing.imageUrl) {
      // imageUrl is something like: "http://localhost:4002/images/filename.png"
      const filename = path.basename(existing.imageUrl);
      const imagePath = path.join(__dirname, "../../images", filename);

      fs.unlink(imagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          // ENOENT = file does not exist, ignore that
          console.warn("Failed to delete CTA image file:", err);
        }
      });
    }

    // 3. Delete the CTA record (cascade will remove BlogCTA entries)
    await prisma.cTA.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "CTA deleted successfully." }],
      data: null,
    });
  } catch (error) {
    console.error("Error deleting CTA:", error);
    next(error);
  }
};
