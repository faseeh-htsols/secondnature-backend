import { Router } from "express";
import { getPoster } from "./getPoster";
// import { deleteUser } from "./deleteUser";
const router = Router();
router.get("/", getPoster);

export default router;
