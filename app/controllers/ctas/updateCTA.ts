import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const updateCTA = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const { heading, paragraph, buttonText, buttonHref, isActive } = req.body;

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

    // 2. Build the updated imageUrl (if a new file was uploaded)
    let imageUrl = existing.imageUrl;
    if (req.file) {
      imageUrl = `${process.env.ADMIN_APP_URI}/images/${req.file.filename}`;

      // fs.renameSync(req.file.path, `path/to/your/uploads/${newFilename}`);
    } // Optionally, move the uploaded file to a new location with the new filename

    // 3. Perform the update
    const updated = await prisma.cTA.update({
      where: { id: Number(id) },
      data: {
        imageUrl,
        heading: heading ? heading.trim() : existing.heading,
        paragraph: paragraph ? paragraph.trim() : existing.paragraph,
        buttonText: buttonText ? buttonText.trim() : existing.buttonText,
        buttonHref: buttonHref ? buttonHref.trim() : existing.buttonHref,
        isActive: typeof isActive === "boolean" ? isActive : existing.isActive,
      },
      select: {
        id: true,
        imageUrl: true,
        heading: true,
        paragraph: true,
        buttonText: true,
        buttonHref: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "CTA updated successfully." }],
      data: { cta: updated },
    });
  } catch (error: any) {
    console.error("Error updating CTA:", error);
    res.status(500).json({
      messages: [{ type: "error", message: "Could not update CTA." }],
      data: null,
    });
  }
};
