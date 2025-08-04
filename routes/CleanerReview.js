import express from "express";
import prisma from "../config/prismaClient.mjs";
import multer from "multer";
const clean_review_Router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
  },
});

const upload = multer({ storage });

clean_review_Router.get("/", async (req, res) => {
  console.log("request made");
  try {
    const reviews = await prisma.cleaner_review.findMany();

    console.log(reviews, "data");

    const serialized = reviews.map((r) => ({
      ...r,
      id: r.id.toString(),
      site_id: r.site_id ? r.site_id.toString() : null,
    }));

    res.json(serialized);
  } catch (err) {
    console.error("Fetch Cleaner Reviews Error:", err);
    res.status(500).json({
      error: "Failed to fetch cleaner reviews",
      detail: {
        message: err.message,
        name: err.name,
        stack: err.stack,
      },
    });
  }
});

// clean_review_Router.post('/', upload.array('images', 5), async (req, res) => {
//   try {
//     const { site_id, name, phone, remarks } = req.body;

//     // Access uploaded file paths
//     const imageFilenames = req.files.map(file => file.filename);

//     const review = await prisma.cleanerReview.create({
//       data: {
//         site_id: BigInt(site_id),
//         name,
//         phone,
//         remarks,
//         images: imageFilenames,
//       },
//     });

//     const serializedReview = {
//       ...review,
//       id: review.id.toString(),
//       site_id: review.site_id.toString(),
//       created_at: review.created_at.toISOString(),
//       updated_at: review.updated_at.toISOString()
//     };

//     res.status(201).json(serializedReview);
//   } catch (err) {
//     console.error("Create Review Error:", err);
//     res.status(400).json({
//       error: "Failed to create review",
//       detail: {
//         message: err.message,
//         name: err.name,
//         stack: err.stack,
//       },
//     });
//   }
// });

// clean_review_Router.post("/", upload.array("images", 5), async (req, res) => {
//   console.log("post request made");
//   try {
//     const {
//       name,
//       phone,
//       images,
//       site_id,
//       remarks,
//       latitude,
//       longitude,
//       address,
//     } = req.body;

//     console.log(req.body , "body data")
//     console.log(req.files , "files")
//     const imageFilenames = req.files.map(file => file.filename);
//     // console.log(
//     //   name,
//     //   phone,
//     //   images,
//     //   remarks,
//     //   latitude,
//     //   longitude,
//     //   address,
//     //   "image"
//     // );

//     const review = await prisma.cleaner_review.create({
//       data: {
//         name,
//         phone,
//         site_id: BigInt(1),
//         remarks,
//         latitude: parseFloat(latitude),
//         longitude: parseFloat(longitude),
//         address,
//         images:imageFilenames ,
//       },
//     });

//     const serializedReview = {
//       ...review,
//       id: review.id.toString(),
//       site_id: review.site_id.toString(),
//       created_at: review.created_at.toISOString(),
//       updated_at: review.updated_at.toISOString(),
//     };

//     res.status(201).json(serializedReview);
//   } catch (err) {
//     console.error("Create Review Error:", err);
//     res.status(400).json({
//       error: "Failed to create review",
//       detail: {
//         message: err.message,
//         name: err.name,
//         stack: err.stack,
//       },
//     });
//   }
// });

clean_review_Router.post("/", upload.array("images", 5), async (req, res) => {
  console.log("post request made");
  try {
    const {
      name,
      phone,
      site_id,
      remarks,
      latitude,
      longitude,
      address,
      user_id,
      task_ids, // expected as comma-separated string like "1,5,7"
    } = req.body;

    console.log(task_ids, Array.isArray(task_ids), "taks ids");
    const parsedTaskIds = Array.isArray(task_ids)
      ? task_ids.map((id) => Number(id)) // Convert each element to a number
      : task_ids
      ? task_ids.split(",").map((id) => Number(id.trim())) // Split string and convert to numbers
      : [];
    console.log(parsedTaskIds);
    const imageFilenames = req.files.map((file) => file.filename);
    // const imageFilenames = ["image1.jpg", "image2.jpg"];

    const review = await prisma.cleaner_review.create({
      data: {
        name,
        phone,
        site_id: BigInt(site_id || 1),
        user_id: BigInt(user_id || 1), // fallback if not sent
        task_id: parsedTaskIds,
        remarks,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        images: imageFilenames,
      },
    });

    const serializedReview = {
      ...review,
      id: review.id.toString(),
      site_id: review.site_id.toString(),
      user_id: review.user_id.toString(),
      created_at: review.created_at.toISOString(),
      updated_at: review.updated_at.toISOString(),
    };

    res.status(201).json(serializedReview);
  } catch (err) {
    console.error("Create Review Error:", err);
    res.status(400).json({
      error: "Failed to create review",
      detail: {
        message: err.message,
        name: err.name,
        stack: err.stack,
      },
    });
  }
});

export default clean_review_Router;
