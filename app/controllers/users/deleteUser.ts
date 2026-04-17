import { Request, Response } from "express";
import prisma from "../../utils/prisma-client";

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({
      messages: [{ type: "error", message: "Invalid user ID." }],
      data: null,
    });
    return;
  }

  try {
    const user = await prisma.users.findUnique({ where: { id } });

    if (!user) {
      res.status(404).json({
        messages: [{ type: "error", message: "User not found." }],
        data: null,
      });
      return;
    }

    if (user.role === "SUPER_ADMIN") {
      res.status(403).json({
        messages: [{ type: "error", message: "Cannot delete SUPER_ADMIN." }],
        data: null,
      });
      return;
    }

    await prisma.users.delete({
      where: { id },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "User deleted successfully." }],
      data: null,
    });
  } catch (err: any) {
    console.error("Error deleting user:", err);

    if (err.code === "P2025") {
      res.status(404).json({
        messages: [{ type: "error", message: "User not found." }],
        data: null,
      });
    } else {
      res.status(500).json({
        messages: [{ type: "error", message: "Could not delete user." }],
        data: null,
      });
    }
  }
};
