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
import { generateImageFileName } from "./utils/generate-image-name";
// define variables
const envirnoment = app_conf.env.nodeEnv;
const allowedOrigins = [
  "https://second-nature-frontend-swart.vercel.app",
  "https://second-nature-tau.vercel.app",
  // "http://localhost:5173",
  // "http://localhost:5174",
  // app_conf.env.adminAppUrl,
  // app_conf.env.userAppUrl,
];
const app = express();
app.set("trust proxy", 1);
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

    const newFilename = generateImageFileName(file.originalname);
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
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, {
      origin: true,
      credentials: true,
    });
  } else {
    callback(new Error("Not allowed by CORS"), {
      origin: false,
    });
  }
};

app.use(cors(corsOptions));

const port = 4001;
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
app.get("/", (req, res) => {
  res.send("Second Nature is live");
});
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
