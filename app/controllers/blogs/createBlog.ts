// src/controllers/blogs.ts
import { RequestHandler, Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma-client";
import { DateTime } from "luxon";
import sanitizeHtml from "sanitize-html";
import path from "path";

/* ============================ Types & Helpers ============================ */
type ProseDoc = { type: "doc"; content: any[] };

function nodeToPlainText(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.text || "";
  let out = "";
  if (Array.isArray(node.content)) {
    for (const c of node.content) out += nodeToPlainText(c);
  }
  return out;
}

function docToPlainText(doc?: ProseDoc | null): string {
  if (!doc || doc.type !== "doc" || !Array.isArray(doc.content)) return "";
  let out = "";
  for (const block of doc.content) {
    out += nodeToPlainText(block) + " ";
  }
  return out.replace(/\s+/g, " ").trim();
}

function estimateWordCountAndTimeFromDoc(doc?: ProseDoc | null) {
  const text = docToPlainText(doc);
  const words = text ? text.split(" ").length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  return { words, minutes };
}

/* ================================ Controller ============================= */

export const createBlog: RequestHandler = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      title,
      description,
      slug,
      authorId,
      publishedDate, // not used directly
      scheduledDate, // optional fallback if no file uploaded
      content_json, // TipTap JSON (string or object) ✅
      content_html, // ✅ now accepted and stored
      isPublished,
      shouldAutoPublish,
      seo,
      faqs, // Optional FAQs array
    } = req.body;
    console.log(description);
    // 1) Basic validation
    if (!title || !slug || !authorId || !content_json || !description) {
      res.status(400).json({
        messages: [
          {
            type: "error",
            message: "Please provide title, slug, authorId, and content_json.",
          },
        ],
        data: null,
      });
      return;
    }

    // 2) Ensure author exists
    const author = await prisma.author.findUnique({
      where: { id: Number(authorId) },
    });
    if (!author) {
      res.status(404).json({
        messages: [{ type: "error", message: "Author not found." }],
        data: null,
      });
      return;
    }

    // 3) Parse & validate TipTap JSON (we only store JSON)
    let doc: ProseDoc;
    try {
      const raw =
        typeof content_json === "string"
          ? JSON.parse(content_json)
          : content_json;
      if (!raw || raw.type !== "doc" || !Array.isArray(raw.content)) {
        res.status(400).json({
          messages: [{ type: "error", message: "Invalid content_json shape." }],
          data: null,
        });
        return;
      }
      const rawStr =
        typeof content_json === "string" ? content_json : JSON.stringify(raw);
      const JSON_MAX_BYTES = 500 * 1024; // 500KB
      const byteLen = Buffer.byteLength(rawStr, "utf8");
      if (byteLen > JSON_MAX_BYTES) {
        res.status(413).json({
          messages: [{ type: "error", message: "Rich text JSON too large." }],
          data: null,
        });
        return;
      }
      doc = raw as ProseDoc;
    } catch {
      res.status(400).json({
        messages: [
          { type: "error", message: "content_json is not valid JSON." },
        ],
        data: null,
      });
      return;
    }

    // 4) Word count & reading time from JSON
    const stats = estimateWordCountAndTimeFromDoc(doc);

    // 5) Validate FAQs if provided
    let validatedFaqs: any = undefined;
    if (faqs !== undefined && faqs !== null) {
      try {
        const faqsArray = typeof faqs === "string" ? JSON.parse(faqs) : faqs;

        if (!Array.isArray(faqsArray)) {
          res.status(400).json({
            messages: [{ type: "error", message: "FAQs must be an array." }],
            data: null,
          });
          return;
        }

        // Validate each FAQ
        for (const faq of faqsArray) {
          if (
            typeof faq !== "object" ||
            typeof faq.question !== "string" ||
            typeof faq.answer !== "string"
          ) {
            res.status(400).json({
              messages: [
                {
                  type: "error",
                  message:
                    "Each FAQ must have a 'question' and 'answer' string.",
                },
              ],
              data: null,
            });
            return;
          }

          if (faq.question.trim() === "" || faq.answer.trim() === "") {
            res.status(400).json({
              messages: [
                {
                  type: "error",
                  message: "FAQ question and answer cannot be empty.",
                },
              ],
              data: null,
            });
            return;
          }
        }

        validatedFaqs = faqsArray;
      } catch {
        res.status(400).json({
          messages: [{ type: "error", message: "Invalid FAQs format." }],
          data: null,
        });
        return;
      }
    }

    /* ================= COVER IMAGE HANDLING ================= */
    if (!req.file) {
      res.status(400).json({
        messages: [{ type: "error", message: "Please upload an author image" }],
        data: null,
      });
      return;
    }

    /* ================= Scheduling / publish decisions ================= */
    const now = DateTime.now();
    const scheduledInput =
      scheduledDate &&
      typeof scheduledDate === "string" &&
      scheduledDate.trim() !== ""
        ? scheduledDate
        : null;

    let scheduled: Date | null = null;
    let publishNow: boolean;

    if (!scheduledInput) {
      scheduled = now.toJSDate();
      publishNow = isPublished === false ? false : true;
    } else {
      const parsed = DateTime.fromISO(scheduledInput, { zone: "utc" });
      scheduled = parsed.toJSDate();
      publishNow = parsed <= DateTime.utc();
      if (isPublished === false) publishNow = false;
    }

    // If publishing immediately, a cover image is required.
    // if (publishNow) {
    //   res.status(400).json({
    //     messages: [
    //       { type: "error", message: "Cover image is required to publish." },
    //     ],
    //     data: null,
    //   });
    //   return;
    // }

    // ✅ decide what HTML to store (string or empty)
    const htmlToStore = typeof content_html === "string" ? content_html : "";
    // const pictureUrl = `https://cms.nuyu-dental.co.uk/images/${req.file.filename}`;
    let pictureUrl;

    pictureUrl = `${process.env.ADMIN_APP_URI}/images/${req.file.filename}`;

    // fs.renameSync(req.file.path, `path/to/your/uploads/${newFilename}`);
    // Optionally, move the uploaded file to a new location with the new filename

    // 6) Create blog
    const newBlog = await prisma.$transaction(async (tx) => {
      const blog = await tx.blog.create({
        data: {
          title,
          description,
          slug,
          authorId: Number(authorId),
          pictureUrl: pictureUrl || "", // allow empty for drafts
          scheduledDate: scheduled,
          isPublished: publishNow,
          shouldAutoPublish:
            typeof shouldAutoPublish === "boolean" ? shouldAutoPublish : true,
          publishedDate: publishNow ? new Date() : null,
          contentJson: doc, // ✅ store JSON
          contentHtml: htmlToStore, // ✅ store HTML too
          faqs: validatedFaqs, // ✅ store FAQs if provided
          wordCount: stats.words,
          readingTimeMin: stats.minutes,
        },
      });

      if (seo) {
        await tx.blogSEO.upsert({
          where: { blogId: blog.id },
          create: { blogId: blog.id, ...seo },
          update: { ...seo },
        });
      }

      return blog;
    });

    res.status(201).json({
      messages: [{ type: "success", message: "Blog created successfully." }],
      data: { blog: newBlog },
    });
  } catch (error: any) {
    console.error("Error creating blog:", error);
    if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
      res.status(409).json({
        messages: [{ type: "error", message: "Slug already in use." }],
        data: null,
      });
      return;
    }
    next(error);
  }
};
