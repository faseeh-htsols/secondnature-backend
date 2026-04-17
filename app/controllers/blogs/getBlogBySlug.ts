import { RequestHandler, Request, Response } from "express";
import prisma from "../../utils/prisma-client";
import { splitIntoSectionsNoIntro } from "../../utils/split-into-sections";

export const getBlogBySlug: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      res.status(400).json({
        messages: [{ type: "error", message: "Slug is required." }],
        data: null,
      });
      return;
    }

    const blog = await prisma.blog.findFirst({
      where: { slug, isPublished: true },
      include: {
        author: true,
        seo: true,
        blogTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        blogCTAs: {
          where: {
            cta: { isActive: true }, // only active CTAs (optional)
          },
          include: {
            cta: {
              select: {
                id: true,
                imageUrl: true,
                heading: true,
                paragraph: true,
                buttonText: true,
                buttonHref: true,
              },
            },
          },
          orderBy: {
            sectionIndex: "asc", // keep them in the right order
          },
        },
      },
    });

    if (!blog) {
      res.status(404).json({
        messages: [
          { type: "error", message: "Blog not found or unpublished." },
        ],
        data: null,
      });
      return;
    }

    // Process contentHtml into structured sections
    const sections = blog.contentHtml
      ? splitIntoSectionsNoIntro(blog.contentHtml)
      : [];

    // ========= RELATED BLOGS BY TAG =========
    const tagIds = blog.blogTags.map((bt: any) => bt.tagId ?? bt.tag.id);

    let relatedBlogs: {
      title: string;
      scheduledDate: Date | null;
      pictureUrl: string | null;
      slug: string;
    }[] = [];

    if (tagIds.length > 0) {
      relatedBlogs = await prisma.blog.findMany({
        where: {
          isPublished: true,
          slug: { not: slug }, // exclude current blog
          blogTags: {
            some: {
              tagId: { in: tagIds },
            },
          },
        },
        select: {
          title: true,
          scheduledDate: true,
          pictureUrl: true,
          slug: true,
        },
        orderBy: {
          scheduledDate: "desc",
        },
        take: 6,
      });
    }

    // Attach sections + relatedBlogs inside blog
    const blogWithSectionsAndRelated = {
      ...blog,
      sections,
      relatedBlogs,
    };

    res.status(200).json({
      messages: [{ type: "success", message: "Blog fetched successfully." }],
      data: {
        blog: blogWithSectionsAndRelated, // 👈 everything lives under blog
      },
    });
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    res.status(500).json({
      messages: [{ type: "error", message: "Failed to fetch blog." }],
      data: null,
    });
  }
};
