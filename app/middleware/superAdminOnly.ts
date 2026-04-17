import { Request, Response, NextFunction } from "express";

export const superAdminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = (req as any).user;
  if (!user || user.role !== "SUPER_ADMIN") {
    res.status(403).json({
      messages: [{ type: "error", message: "Forbidden: Access is denied" }],
    });
    return;
  }

  next();
};
