import { Router } from "express";
import { createCommonForm } from "./create-common-form";
import { submitDynamicForm } from "./submitDynamicForm";

const router = Router();
router.post("/submit-form", createCommonForm)
router.post("/submit-form-dynamic", submitDynamicForm)
export default router;
