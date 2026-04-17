// src/controllers/userController.ts

import { Request, Response } from "express";
import prisma from "../../utils/prisma-client";
import bcrypt from "bcryptjs";

export const updateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({
      messages: [{ type: "error", message: "Invalid user ID." }],
      data: null,
    });
  }

  const {
    username,
    name,
    email,
    password,
    role,
    is_active,
  }: {
    username?: string;
    name?: string;
    email?: string;
    password?: string;
    role?: "ADMIN" | "SUPER_ADMIN";
    is_active?: boolean;
  } = req.body;
  // Build up the `data` object only with fields the client sent:
  const data: any = {};
  if (username) data.username = username;
  if (name) data.name = name;
  if (email) data.email = email;
  if (typeof is_active === "boolean") data.is_active = is_active;
  if (role) data.role = role;

  try {
    // If the client wants to change the password, hash it first:
    if (password) {
      data.password = await bcrypt.hash(password, 12);
    }

    const updated = await prisma.users.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
      },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "User updated successfully." }],
      data: { user: updated },
    });
  } catch (err: any) {
    console.error("Error updating user:", err);

    if (err.code === "P2025") {
      // “Record to update not found”
      res.status(404).json({
        messages: [{ type: "error", message: "User not found." }],
        data: null,
      });
    }
    if (err.code === "P2002") {
      // unique constraint violation
      const field = (err.meta?.target as string[])[0];
      res.status(409).json({
        messages: [{ type: "error", message: `${field} already in use.` }],
        data: null,
      });
    }

    res.status(500).json({
      messages: [{ type: "error", message: "Could not update user." }],
      data: null,
    });
  }
};
