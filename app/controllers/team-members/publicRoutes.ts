// import { createUsers } from "./createUsers";
import { Router } from "express";
// import { getAllUsers } from "./getAllUsers";
// import { getUserById } from "./getUserById";
// import { updateUser } from "./updateUser";

import { getAllTeamMembersWebsite } from "./getAllTeamMembersWebsite";
import { getTeamMemberById } from "./getTeamMemberById";
// import { deleteUser } from "./deleteUser";
const router = Router();
router.get("/", getAllTeamMembersWebsite);
router.get("/:id", getTeamMemberById);

export default router;
