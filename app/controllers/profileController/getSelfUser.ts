import { Request, Response } from "express";
import prisma from "../../utils/prisma-client";
// Define inline type again if needed
interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

export const getSelfUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      messages: [{ type: "error", message: "Unauthorized." }],
      data: null,
    });
    return;
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: Number(req.user.userId) },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
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
      messages: [{ type: "success", message: "User profile fetched." }],
      data: { user },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      messages: [{ type: "error", message: "Something went wrong." }],
      data: null,
    });
  }
};
