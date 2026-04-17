import { Router } from "express";
import { createCTA } from "./createCTA";
import { getAllCTAs } from "./getAllCTAs";
import { getCTAById } from "./getCTAById";
import { updateCTA } from "./updateCTA";
import { deleteCTA } from "./deleteCTA";

const router = Router();

router.post("/", createCTA);
router.get("/", getAllCTAs);
router.get("/:id", getCTAById);
router.put("/:id", updateCTA);
router.delete("/:id", deleteCTA);

export default router;

