import { Request, Response } from "express";
import prisma from "../../utils/prisma-client";

export const togglePublishStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    let { action } = req.body; // "publish" or "unpublish"

    if (!id) {
      res.status(400).json({
        messages: [{ type: "error", message: "Blog ID is required." }],
        data: null,
      });
      return;
    }

    if (!["publish", "unpublish"].includes(action?.toLowerCase())) {
      res.status(400).json({
        messages: [
          {
            type: "error",
            message: "Action must be 'publish' or 'unpublish'.",
          },
        ],
        data: null,
      });
      return;
    }

    const isPublished = action.toLowerCase() === "publish";

    const updatedBlog = await prisma.blog.update({
      where: { id: Number(id) },
      data: {
        isPublished,
        publishedDate: isPublished ? new Date() : null,
        shouldAutoPublish: isPublished ? true : false, // <-- required logic
      },
      select: {
        id: true,
        title: true,
        isPublished: true,
        publishedDate: true,
        shouldAutoPublish: true,
      },
    });

    res.status(200).json({
      messages: [
        {
          type: "success",
          message: `Blog has been ${
            isPublished ? "published" : "unpublished"
          } successfully.`,
        },
      ],
      data: { blog: updatedBlog },
    });
  } catch (error) {
    console.error("Error updating publish status:", error);
    res.status(500).json({
      messages: [
        { type: "error", message: "Failed to update publish status." },
      ],
      data: null,
    });
  }
};
