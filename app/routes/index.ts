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
import publicformRoutes from "../controllers/contact-forms/publicRoutes";
import formRoutes from "../controllers/contact-forms/routes";
import teamRoutes from "../controllers/team-members/routes";
import posterRoutes from "../controllers/poster/routes";
import posterPublicRoutes from "../controllers/poster/publicRoutes";
import teamPublicRoutes from "../controllers/team-members/publicRoutes";
const router = express.Router();
router.use("/members-site", teamPublicRoutes)
router.use("/poster-site", posterPublicRoutes)
router.use("/form", publicformRoutes)
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
router.use("/common-form", formRoutes)
router.use("/team-members", teamRoutes)
router.use("/profile", verifyToken, profileRoutes);
router.use("/poster", posterRoutes)
export default router;
