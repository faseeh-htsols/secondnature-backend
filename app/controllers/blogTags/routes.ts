import { Router } from "express";
import { assignTagToBlog } from "./assignTagToBlog";
import { removeTagFromBlog } from "./removeTagFromBlog";
import { getBlogTags } from "./getBlogTags";

const router = Router();

router.post("/", assignTagToBlog);
router.get("/blog/:blogId", getBlogTags);
router.delete("/:id", removeTagFromBlog);

export default router;

