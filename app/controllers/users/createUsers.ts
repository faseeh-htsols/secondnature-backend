import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
export const createUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { username, name, email, password } = req.body;

  if (!username) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide username" }],
      data: null,
    });
  }
  if (!name) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide name" }],
      data: null,
    });
  }
  if (!email) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide email" }],
      data: null,
    });
  }
  if (!password) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide password" }],
      data: null,
    });
  }

  try {
    // 1. Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 2. Create the user in Prisma
    const newUser = await prisma.users.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        role: "ADMIN", // if you want to set a default role here
      },
      // optionally omit the password from the ed object:
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // 3.  the created user (without the password)
    res.status(201).json({
      messages: [{ type: "success", message: "User created successfully." }],
      data: { user: newUser },
    });
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle unique-constraint violations explicitly if you like:
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      res.status(409).json({
        messages: [{ type: "error", message: "Email already in use." }],
        data: null,
      });
    }

    res.status(500).json({
      messages: [{ type: "error", message: "Could not create user." }],
      data: null,
    });
  }
};
