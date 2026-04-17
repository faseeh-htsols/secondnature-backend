import express, { Request, Response, NextFunction } from "express";
import logger from "./config/logger";
import app_conf from "./config";
import path from "path";
import dotenv from "dotenv";
import routes from "./routes";
import fs from "fs";
import cors, { CorsOptionsDelegate } from "cors";
import multer, { FileFilterCallback } from "multer";
import { startBlogScheduler } from "./cron/publishScheduledBlogs";
import { ErrorRequestHandler } from "express";
// define variables

const envirnoment = app_conf.env.nodeEnv;
const allowedOrigins = [
  "https://www.htsol.ca",
  "https://blogs.htsol.ca",
  // "http://localhost:5173",
  // "http://localhost:5174",
  // app_conf.env.adminAppUrl,
  // app_conf.env.userAppUrl,
];
const app = express();
if (envirnoment === "development") {
  dotenv.config({ path: path.resolve(__dirname, `../.env.${envirnoment}`) });
} else {
  dotenv.config();
}
const uploadPath = path.join(__dirname, "..", "images");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using a timestamp and the original file extension
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    const fileExtension = path.extname(file.originalname); // Get the file extension (.jpg, .png, etc.)
    const newFilename = `author-image-${timestamp}${fileExtension}`; // Rename the file

    cb(null, newFilename); // Provide the new filename to multer
  },
});
// file filter
const fileFlter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// configure CORS middleware
const corsOptions: CorsOptionsDelegate = (req, callback) => {
  let corsOptions;
  if (allowedOrigins.indexOf(req.headers.origin!) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: true };
  }
  callback(null, corsOptions);
};
app.use(cors(corsOptions));

const port = 4000;
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFlter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }).single("image"),
);
app.use("/images", express.static(path.join(__dirname, "..", "images")));
app.use("/api", routes);
// After all routes (KEEP this at the bottom)
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        messages: [{ type: "error", message: "File size exceeds 10MB limit." }],
        data: null,
      });
      return;
    }
    res.status(400).json({
      messages: [{ type: "error", message: `Upload error: ${err.message}` }],
      data: null,
    });
    return;
  }

  console.error("Unexpected Error:", err);
  res.status(500).json({
    messages: [{ type: "error", message: "An unexpected error occurred." }],
    data: null,
  });
};

app.use(errorHandler);

app.listen(port, "0.0.0.0", () => {
  logger.info(`server is running ${port}`);
  // setupSwagger(app);
  startBlogScheduler();
});
