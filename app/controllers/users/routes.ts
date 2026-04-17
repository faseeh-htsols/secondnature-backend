import { createUsers } from "./createUsers";
import { Router } from "express";
import { getAllUsers } from "./getAllUsers";
import { getUserById } from "./getUserById";
import { updateUser } from "./updateUser";
import { deleteUser } from "./deleteUser";
const router = Router();
router.post("/", createUsers);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
