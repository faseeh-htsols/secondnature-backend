import express from "express";
import {
  login,
  requestResetPassword,
  resetPassword,
  validateResetPasswordToken,
} from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import userRoutes from "../controllers/users/routes";
import authorRoutes from "../controllers/authors/routes";
import blogRoutes from "../controllers/blogs/routes";
import blogPublicRoutes from "../controllers/blogs/publicRoutes";
import tagRoutes from "../controllers/tags/routes";
import ctaRoutes from "../controllers/ctas/routes";
import blogCtaRoutes from "../controllers/blogCtas/routes";
import blogTagRoutes from "../controllers/blogTags/routes";
// import googleRoutes from "../controllers/google-reviews/routes";
import profileRoutes from "../controllers/profileController/routes";
import { superAdminOnly } from "../middleware/superAdminOnly";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

router.use("/client/blogs", blogPublicRoutes);
// router.use("/google-reviews", googleRoutes);
router.post("/auth/login", login);
router.post("/auth/request-reset-password", requestResetPassword);
router.post("/auth/validate-reset-password-token", validateResetPasswordToken);
router.post("/auth/reset-password", resetPassword);
// -----------Middleware-----------
router.use(authMiddleware);
router.use("/blogs", blogRoutes);
router.use("/authors", authorRoutes);
router.use("/tags", tagRoutes);
router.use("/ctas", ctaRoutes);
router.use("/blog-ctas", blogCtaRoutes);
router.use("/blog-tags", blogTagRoutes);
router.use("/users", superAdminOnly, userRoutes);
router.use("/profile", verifyToken, profileRoutes);

export default router;
