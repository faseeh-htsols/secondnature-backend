// src/controllers/blogs.ts
import { RequestHandler, Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma-client";
import { DateTime } from "luxon";
import sanitizeHtml from "sanitize-html";
import path from "path";

/* ---- keep anchors & lists; safe attributes/schemes ---- */
function sanitizeCachedHtml(html?: string | null) {
  if (typeof html !== "string") return undefined;

  const clean = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "span",
      "img", // harmless even if you never use from editor
      "a",
      "br",
      "p",
      "strong",
      "em",
      "u",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto", "tel"],
      img: ["http", "https"],
    },
    transformTags: {
      a: (_tag, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          rel: "noopener noreferrer nofollow",
          target: attribs.target === "_blank" ? "_blank" : "_self",
        },
      }),
      img: (_tag, attribs) => ({
        tagName: "img",
        attribs: {
          loading: "lazy",
          decoding: "async",
          ...attribs,
        },
      }),
    },
    exclusiveFilter(frame: any) {
      // drop empty tags like <p></p> / <span>  </span>
      if (!frame.text) return false;
      return frame.text.replace(/\s+/g, "") === "";
    },
  });

  return clean;
}

export const updateBlog: RequestHandler = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      slug,
      authorId,
      publishedDate,
      scheduledDate,
      isPublished, // not used to force publish state here
      content_json, // TipTap JSON (string or object)
      content_html, // cached HTML from TipTap
      faqs, // Optional FAQs array
    } = req.body;

    if (!id || !title || !slug || !authorId || !description) {
      res.status(400).json({
        messages: [{ type: "error", message: "Missing required fields." }],
        data: null,
      });
      return;
    }

    // Blog & author existence
    const existingBlog = await prisma.blog.findUnique({
      where: { id: Number(id) },
    });
    if (!existingBlog) {
      res.status(404).json({
        messages: [{ type: "error", message: "Blog not found." }],
        data: null,
      });
      return;
    }

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

    // Optional cover handling (unchanged)
    let pictureUrl = existingBlog.pictureUrl;
    if (req.file) {
      pictureUrl = `${process.env.ADMIN_APP_URI}/images/${req.file.filename}`;

      // fs.renameSync(req.file.path, `path/to/your/uploads/${newFilename}`);
    } // Optionally, move the uploaded file to a new location with the new filename

    // Dates
    const published = publishedDate ? new Date(publishedDate) : null;

    const now = DateTime.now();
    const scheduledInput =
      typeof scheduledDate === "string" && scheduledDate.trim() !== ""
        ? scheduledDate
        : null;

    let scheduled: Date;
    let finalIsPublished: boolean;

    if (!scheduledInput) {
      scheduled = now.toJSDate();
      finalIsPublished = true;
    } else {
      const parsed = DateTime.fromISO(scheduledInput, { zone: "utc" });
      scheduled = parsed.toJSDate();
      finalIsPublished = parsed <= DateTime.utc();
    }

    /* ================= TipTap JSON ================= */
    let newDoc: any | undefined;
    if (typeof content_json !== "undefined") {
      try {
        const raw =
          typeof content_json === "string"
            ? JSON.parse(content_json)
            : content_json;

        if (!raw || raw.type !== "doc" || !Array.isArray(raw.content)) {
          res.status(400).json({
            messages: [
              { type: "error", message: "Invalid content_json shape." },
            ],
            data: null,
          });
          return;
        }

        const rawStr =
          typeof content_json === "string" ? content_json : JSON.stringify(raw);
        const JSON_MAX_BYTES = 500 * 1024;
        const byteLen = Buffer.byteLength(rawStr, "utf8");
        if (byteLen > JSON_MAX_BYTES) {
          res.status(413).json({
            messages: [{ type: "error", message: "Rich text JSON too large." }],
            data: null,
          });
          return;
        }

        newDoc = raw;
      } catch {
        res.status(400).json({
          messages: [
            { type: "error", message: "content_json is not valid JSON." },
          ],
          data: null,
        });
        return;
      }
    }

    /* ================= HTML (sanitized) ================= */
    const cleanHTML = sanitizeCachedHtml(content_html); // undefined if not provided
    if (typeof cleanHTML === "string") {
      const HTML_MAX_CHARS = 150_000;
      if (cleanHTML.length > HTML_MAX_CHARS) {
        res.status(413).json({
          messages: [{ type: "error", message: "Rich text HTML too large." }],
          data: null,
        });
        return;
      }
      const imgCount = (cleanHTML.match(/<img\b/gi) || []).length;
      if (imgCount > 50) {
        res.status(400).json({
          messages: [{ type: "error", message: "Too many images in content." }],
          data: null,
        });
        return;
      }
    }

    /* ================= FAQs Validation ================= */
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

    /* ================= Stats ================= */
    const htmlForStats =
      typeof cleanHTML === "string"
        ? cleanHTML
        : existingBlog.contentHtml || "";

    const textFromHtml = htmlForStats
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    let wordCount = textFromHtml ? textFromHtml.split(" ").length : 0;
    let readingTimeMin = Math.max(1, Math.round(wordCount / 200));

    // If there is no HTML anywhere, fallback to JSON text
    if (!wordCount) {
      const nodeToPlainText = (node: any): string => {
        if (!node) return "";
        if (node.type === "text") return node.text || "";
        let out = "";
        if (Array.isArray(node.content)) {
          for (const c of node.content) out += nodeToPlainText(c);
        }
        return out;
      };
      const docToPlainText = (doc?: any): string => {
        if (!doc || doc.type !== "doc" || !Array.isArray(doc.content))
          return "";
        let out = "";
        for (const block of doc.content) out += nodeToPlainText(block) + " ";
        return out.replace(/\s+/g, " ").trim();
      };

      const finalDoc = newDoc ?? (existingBlog.contentJson as any) ?? null;
      const txt = docToPlainText(finalDoc);
      wordCount = txt ? txt.split(" ").length : 0;
      readingTimeMin = Math.max(1, Math.round(wordCount / 200));
    }

    /* ================= Update ================= */
    const updatedBlog = await prisma.blog.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        slug,
        pictureUrl: pictureUrl,
        authorId: Number(authorId),
        publishedDate: published,
        scheduledDate: scheduled,
        isPublished: finalIsPublished,

        ...(newDoc ? { contentJson: newDoc } : {}),
        ...(typeof cleanHTML === "string" ? { contentHtml: cleanHTML } : {}),
        ...(validatedFaqs !== undefined ? { faqs: validatedFaqs } : {}),

        wordCount,
        readingTimeMin,
      },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "Blog updated successfully." }],
      data: { blog: updatedBlog },
    });
  } catch (error: any) {
    console.error("Error updating blog:", error);
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
