import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to authenticate the JWT token
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({
      messages: [{ type: "error", message: "Authorization token missing" }],
      data: null,
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      role: string;
    };

    // Attach the decoded user info to the request object for use in the route
    (req as any).user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({
      messages: [{ type: "error", message: "Invalid or expired token" }],
      data: null,
    });
  }
};
