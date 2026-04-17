import { Router } from "express";
import { assignCTAToBlog } from "./assignCTAToBlog";
import { removeCTAFromBlog } from "./removeCTAFromBlog";
import { getBlogCTAs } from "./getBlogCTAs";
import { updateCTAPosition } from "./updateCTAPosition";

const router = Router();

router.post("/", assignCTAToBlog);
router.get("/blog/:blogId", getBlogCTAs);
router.put("/:id", updateCTAPosition);
router.delete("/:id", removeCTAFromBlog);

export default router;

