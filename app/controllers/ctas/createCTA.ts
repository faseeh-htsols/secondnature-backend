import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const createCTA = async (req: Request, res: Response): Promise<void> => {
  const { heading, paragraph, buttonText, buttonHref, isActive } = req.body;

  // Validation
  // if (!heading || typeof heading !== "string" || heading.trim() === "") {
  //   res.status(400).json({
  //     messages: [{ type: "error", message: "Please provide a valid heading" }],
  //     data: null,
  //   });
  //   return;
  // }

  // if (!paragraph || typeof paragraph !== "string" || paragraph.trim() === "") {
  //   res.status(400).json({
  //     messages: [
  //       { type: "error", message: "Please provide a valid paragraph" },
  //     ],
  //     data: null,
  //   });
  //   return;
  // }

  if (
    !buttonText ||
    typeof buttonText !== "string" ||
    buttonText.trim() === ""
  ) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide button text" }],
      data: null,
    });
    return;
  }

  if (
    !buttonHref ||
    typeof buttonHref !== "string" ||
    buttonHref.trim() === ""
  ) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide button href" }],
      data: null,
    });
    return;
  }

  // if (!req.file) {
  //   res.status(400).json({
  //     messages: [{ type: "error", message: "Please upload a CTA image" }],
  //     data: null,
  //   });
  //   return;
  // }

  try {
    // const imageUrl = `https://cms.nuyu-dental.co.uk/images/${req.file.filename}`;
    let imageUrl;
    if (req.file) {
      imageUrl = `${process.env.ADMIN_APP_URI}/images/${req.file.filename}`;

      // fs.renameSync(req.file.path, `path/to/your/uploads/${newFilename}`);
    } // Optionally, move the uploaded file to a new location with the new filename

    const safeHeading = typeof heading === "string" ? heading.trim() : null;

    const safeParagraph =
      typeof paragraph === "string" ? paragraph.trim() : null;

    const newCTA = await prisma.cTA.create({
      data: {
        imageUrl,
        heading: safeHeading,
        paragraph: safeParagraph,
        buttonText: buttonText.trim(),
        buttonHref: buttonHref.trim(),
        isActive: typeof isActive === "boolean" ? isActive : true,
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

    res.status(201).json({
      messages: [{ type: "success", message: "CTA created successfully." }],
      data: { cta: newCTA },
    });
  } catch (error: any) {
    console.error("Error creating CTA:", error);
    res.status(500).json({
      messages: [{ type: "error", message: "Could not create CTA." }],
      data: null,
    });
  }
};
