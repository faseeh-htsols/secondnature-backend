import { RequestHandler } from "express";
import prisma from "../../utils/prisma-client";

// GET SEO by blogId
export const getBlogSEO: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { id } = req.params;

    const seo = await prisma.blogSEO.findUnique({
      where: { blogId: Number(id) },
    });

    if (!seo) {
      // If no SEO exists, return a default empty structure instead of 404
      res.status(200).json({
        messages: [
          { type: "info", message: "No SEO found. Returning default values." },
        ],
        seo: {
          seoTitle: "",
          seoDescription: "",
          seoImageAlt: "",
          schemaJson: [],
        },
      });
      return;
    }

    res.status(200).json({
      messages: [
        { type: "success", message: "SEO data fetched successfully." },
      ],
      seo,
    });
  } catch (error) {
    console.error("Error fetching SEO:", error);
    res.status(500).json({
      messages: [{ type: "error", message: "Failed to fetch SEO." }],
      data: null,
    });
    next(error);
  }
};
