// src/controllers/userController.ts

import { Request, Response } from "express";
import prisma from "../../utils/prisma-client";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../../middleware/verifyToken";
export const updateSelfUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.userId; // 👈 extracted from token middleware
  if (!userId) {
    res.status(401).json({
      messages: [{ type: "error", message: "Unauthorized." }],
      data: null,
    });
    return;
  }

  const {
    username,
    name,
    email,
    password,
  }: {
    username?: string;
    name?: string;
    email?: string;
    password?: string;
  } = req.body;

  const data: any = {};
  if (username) data.username = username;
  if (name) data.name = name;
  if (email) data.email = email;

  try {
    if (password) {
      data.password = await bcrypt.hash(password, 12);
    }

    const updated = await prisma.users.update({
      where: { id: Number(userId) },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "Profile updated successfully." }],
      data: { user: updated },
    });
  } catch (err: any) {
    console.error("Error updating profile:", err);

    if (err.code === "P2025") {
      res.status(404).json({
        messages: [{ type: "error", message: "User not found." }],
        data: null,
      });
      return;
    }

    if (err.code === "P2002") {
      const field = (err.meta?.target as string[])[0];
      res.status(409).json({
        messages: [{ type: "error", message: `${field} already in use.` }],
        data: null,
      });
      return;
    }

    res.status(500).json({
      messages: [{ type: "error", message: "Could not update profile." }],
      data: null,
    });
  }
};
