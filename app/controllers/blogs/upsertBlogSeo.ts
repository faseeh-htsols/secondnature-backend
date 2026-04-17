import { RequestHandler } from "express";
import prisma from "../../utils/prisma-client";
import fs from "fs/promises";
import path from "path";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function timestampYmdHms() {
  const d = new Date();
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(
    d.getDate(),
  )}-${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "") // keep only a-z, 0-9, hyphen
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export const upsertBlogSEO: RequestHandler = async (
  req,
  res,
): Promise<void> => {
  try {
    const { blogId, seoTitle, seoDescription, seoImageAlt, schemaJson } =
      req.body;

    if (!blogId) {
      res.status(400).json({
        messages: [{ type: "error", message: "blogId is required." }],
        data: null,
      });
      return;
    }

    const blog = await prisma.blog.findUnique({
      where: { id: Number(blogId) },
    });

    if (!blog) {
      res.status(404).json({
        messages: [{ type: "error", message: "Blog not found." }],
        data: null,
      });
      return;
    }

    let parsedSchema: any[] | undefined;
    if (schemaJson) {
      try {
        parsedSchema = Array.isArray(schemaJson)
          ? schemaJson
          : JSON.parse(schemaJson);
      } catch {
        res.status(400).json({
          messages: [{ type: "error", message: "Invalid schemaJson format." }],
          data: null,
        });
        return;
      }
    }

    const seoData: any = {};
    if (seoTitle !== undefined) seoData.seoTitle = seoTitle;
    if (seoDescription !== undefined) seoData.seoDescription = seoDescription;
    if (seoImageAlt !== undefined) seoData.seoImageAlt = seoImageAlt;
    if (parsedSchema !== undefined) seoData.schemaJson = parsedSchema;

    // ✅ Rename uploaded file inside controller (web-safe datetime name)
    if (req.file) {
      const baseUrl = process.env.ADMIN_APP_URI || "https://cms.htsol.ca";

      // ✅ persist the URL (IMPORTANT)
      seoData.imageUrl = `${baseUrl}/images/${req.file.filename}`;
    }

    const seo = await prisma.blogSEO.upsert({
      where: { blogId: Number(blogId) },
      update: seoData,
      create: {
        blogId: Number(blogId),
        seoTitle: seoTitle || "",
        seoDescription: seoDescription || "",
        seoImageAlt: seoImageAlt || "",
        schemaJson: parsedSchema || [],
        imageUrl: seoData.imageUrl || "", // ✅ store on create too
      },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "SEO data saved successfully." }],
      data: seo,
    });
  } catch (error) {
    console.error("Error saving SEO:", error);
    res.status(500).json({
      messages: [
        {
          type: "error",
          message: "An unexpected error occurred while saving SEO data.",
        },
      ],
      data: null,
    });
  }
};
