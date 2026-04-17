import { Router } from "express";
import { getPublishedBlogs } from "./getPublishedBlogs";
import { getBlogById } from "./getBlogsById";
import { getBlogBySlug } from "./getBlogBySlug";
const router = Router();
router.get("/", getPublishedBlogs);
router.get("/:slug", getBlogBySlug); // This route is for fetching published blogs
export default router;
