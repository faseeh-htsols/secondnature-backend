import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
export const createAuthor = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { name, bio } = req.body;

  if (!name) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide name" }],
      data: null,
    });
    return;
  }
  if (!bio) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide bio" }],
      data: null,
    });
    return;
  }
  if (!req.file) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please upload an author image" }],
      data: null,
    });
    return;
  }

  try {
    // Construct the public URL/path for the stored image (this will reflect the new filename)
    const pictureUrl = `${process.env.ADMIN_APP_URI}/images/${req.file.filename}`;
    console.log("Picture URL:", pictureUrl);

    const newAuthor = await prisma.author.create({
      data: {
        name,
        bio,
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

    res.status(201).json({
      messages: [{ type: "success", message: "Author created successfully." }],
      data: { author: newAuthor },
    });
  } catch (error: any) {
    console.error("Error creating author:", error);

    // Example: catch a unique-constraint on name if you had one
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      res.status(409).json({
        messages: [
          {
            type: "error",
            message: "An author with that name already exists.",
          },
        ],
        data: null,
      });
      return;
    }

    res.status(500).json({
      messages: [{ type: "error", message: "Could not create author." }],
      data: null,
    });
  }
};
