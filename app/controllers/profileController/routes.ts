import { Router } from "express";
import { updateSelfUser } from "./updateSelfUser";
import { getSelfUser } from "./getSelfUser";
import { Request, Response } from "express";
const router = Router();

router.get("/", getSelfUser);
router.put("/", updateSelfUser);

export default router;
