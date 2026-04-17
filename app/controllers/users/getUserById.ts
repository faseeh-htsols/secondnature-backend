// src/controllers/users.ts
import { Request, Response } from "express";
import prisma from "../../utils/prisma-client";

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await prisma.users.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      res.status(404).json({
        messages: [{ type: "error", message: "User not found." }],
        data: null,
      });
      return;
    }

    res.status(200).json({
      messages: [{ type: "success", message: "User fetched successfully." }],
      data: { user },
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({
      messages: [{ type: "error", message: "Could not fetch user." }],
      data: null,
    });
  }
};
