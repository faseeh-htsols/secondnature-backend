import { Router } from "express";
import { createTag } from "./createTag";
import { getAllTags } from "./getAllTags";
import { getTagById } from "./getTagById";
import { updateTag } from "./updateTag";
import { deleteTag } from "./deleteTag";

const router = Router();

router.post("/", createTag);
router.get("/", getAllTags);
router.get("/:id", getTagById);
router.put("/:id", updateTag);
router.delete("/:id", deleteTag);

export default router;

