import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Define inline AuthRequest type
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      messages: [{ type: "error", message: "Missing or invalid token." }],
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({
      messages: [{ type: "error", message: "Invalid or expired token." }],
    });
    return;
  }
};
