import { Router } from "express";
import { getAllCommonForms } from "./getAllforms";

const router = Router();
router.get("/", getAllCommonForms)
export default router;
