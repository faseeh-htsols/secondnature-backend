// src/controllers/userController.ts

import { Request, Response } from "express";
import prisma from "../../utils/prisma-client";

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.users.findMany({
      where: {
        role: {
          not: "SUPER_ADMIN",
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "Users fetched successfully." }],
      data: { users },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      messages: [{ type: "error", message: "Could not fetch users." }],
      data: null,
    });
  }
};
