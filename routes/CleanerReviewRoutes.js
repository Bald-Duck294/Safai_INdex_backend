// import express from "express";
// import multer from "multer";

// import {
//   getCleanerReview,
//   getCleanerReviewsById,
//   createCleanerReview,
// } from "../controller/cleanerReviewController.js";
// const clean_review_Router = express.Router();

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = file.originalname.split(".").pop();
//     cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
//   },
// });
// const upload = multer({ storage });

// // Debug middleware to log incoming field names before multer processes them
// const debugFields = (req, res, next) => {
//   req.on('data', (chunk) => {
//     console.log('Incoming chunk:', chunk.toString());
//   });
//   next();
// };


// clean_review_Router.post(
//   "/",
//   debugFields,
//   upload.fields([
//     { name: "before_photos", maxCount: 5 },
//     { name: "after_photos", maxCount: 5 }
//   ]),
//   createCleanerReview
// );


// // Routes
// clean_review_Router.get("/", getCleanerReview); // optional ?cleaner_user_id
// clean_review_Router.get("/:cleaner_user_id", getCleanerReviewsById);
// // clean_review_Router.post("/", upload.array("images", 5), createCleanerReview);
// clean_review_Router.post(
//   "/",
//   upload.fields([
//     { name: "before_photos", maxCount: 5 },
//     { name: "after_photos", maxCount: 5 }
//   ]),
//   createCleanerReview
// );


// export default clean_review_Router;


import express from "express";
import multer from "multer";

import {
  getCleanerReview,
  getCleanerReviewsById,
  createCleanerReview,
} from "../controller/cleanerReviewController.js";

const clean_review_Router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

// Multer instance
const upload = multer({ storage });

// Debug middleware — only logs field names & file info
const debugFields = (req, res, next) => {
  console.log("---- Incoming Request ----");
  console.log("Content-Type:", req.headers["content-type"]);

  // Log only text fields in the body
  req.on("data", (chunk) => {
    // We won't log binary data to avoid console spam
    if (chunk.toString().includes("filename")) {
      console.log("[File Upload Detected]");
    }
  });

  // Listen for multer file events
  req.on("end", () => {
    console.log("---- Request Data Received ----");
  });

  next();
};

// Routes
clean_review_Router.get("/", getCleanerReview); // Optional ?cleaner_user_id
clean_review_Router.get("/:cleaner_user_id", getCleanerReviewsById);

clean_review_Router.post(
  "/",
  debugFields,
  upload.fields([
    { name: "before_photos", maxCount: 5 },
    { name: "after_photos", maxCount: 5 },
  ]),
  createCleanerReview
);

export default clean_review_Router;
