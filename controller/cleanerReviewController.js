import express from "express";
import prisma from "../config/prismaClient.mjs";
import multer from "multer";
import axios from "axios";

export async function getCleanerReview(req, res) {
  console.log("request made");

  const { cleaner_user_id, status } = req.query;

  try {
    const whereClause = cleaner_user_id
      ? { cleaner_user_id: BigInt(cleaner_user_id) }
      : {};

    if (status) {
      whereClause.status = status;
    }
    console.log(whereClause, "where clause");
    const reviews = await prisma.cleaner_review.findMany({
      where: whereClause,
    });

    console.log(reviews, "reviews");
    const serialized = reviews.map((r) => {
      const safeReview = {};
      for (const [key, value] of Object.entries(r)) {
        safeReview[key] = typeof value === "bigint" ? value.toString() : value;
      }
      return safeReview;
    });

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
}

export const getCleanerReviewsById = async (req, res) => {
  console.log("here");
  const { cleaner_user_id } = req.params;
  try {
    const reviews = await prisma.cleaner_review.findMany({
      where: {
        cleaner_user_id: BigInt(cleaner_user_id),
      },
    });

    const serialized = reviews.map((r) => {
      const safeReview = {};
      for (const [key, value] of Object.entries(r)) {
        safeReview[key] = typeof value === "bigint" ? value.toString() : value;
      }
      return safeReview;
    });

    res.json({
      status: "success",
      data: serialized,
      message: "Data retrived Successfully!",
    });
  } catch (err) {
    console.error("Fetch Reviews by ID Error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch cleaner reviews by ID",
      detail: err,
    });
  }
};

// 1️⃣ Create review (BEFORE phase)
export async function createCleanerReview(req, res) {
  console.log("in create review");
  try {
    const {
      name,
      phone,
      site_id,
      remarks,
      latitude,
      longitude,
      address,
      cleaner_user_id,
      task_ids,
      initial_comment,
    } = req.body;

    const beforePhotos = Array.isArray(req.files?.before_photo)
      ? req.files.before_photo.map((f) => f.filename)
      : Array.isArray(req.body.before_photo)
      ? req.body.before_photo
      : req.body.before_photo
      ? [req.body.before_photo]
      : [];

    console.log(beforePhotos, "photos");
    console.log(req.files, "files");
    console.log(req.files?.before_photos, "actual photo");
    const parsedTaskIds = Array.isArray(task_ids)
      ? task_ids.map(String)
      : task_ids
      ? task_ids.split(",").map((id) => String(id).trim())
      : [];

    const review = await prisma.cleaner_review.create({
      data: {
        name,
        phone,
        site_id: site_id ? BigInt(site_id) : null,
        remarks,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        address,
        cleaner_user_id: cleaner_user_id ? BigInt(cleaner_user_id) : null,
        task_id: parsedTaskIds,
        initial_comment: initial_comment || null,
        before_photo: beforePhotos,
        after_photo: [],
        status: "ongoing",
      },
    });

    console.log(review, "revies");
    const serializedData = [review].map((item) => ({
      ...item,
      id: item?.id.toString(),
      site_id: item?.id.toString(),
      cleaner_user_id: item?.cleaner_user_id.toString(),
    }));

    res.status(201).json({ status: "success", serializedData });
  } catch (err) {
    res.status(400).json({ status: "error", detail: err.message });
  }
}

// 2️⃣ Update review (AFTER phase)
export async function completeCleanerReview(req, res) {
  console.log("in complete clener review");
  try {
    const { final_comment, status, id } = req.body;
    // const { id } = req.params ;

    console.log(req.files, "files");
    console.log(req.files?.after_photo, "after photo");

    const afterPhotos = Array.isArray(req.files?.after_photo)
      ? req.files.after_photo.map((f) => f.filename)
      : Array.isArray(req.body.after_photo)
      ? req.body.after_photo
      : req.body.after_photo
      ? [req.body.after_photo]
      : [];

    console.log(afterPhotos, "after phots");
    const review = await prisma.cleaner_review.update({
      where: { id: BigInt(id) },
      data: {
        after_photo: afterPhotos,
        final_comment: final_comment || null,
        status: status || "completed",
      },
    });

    console.log("after review", review);

    const serializedData = [review].map((item) => ({
      ...item,
      id: item?.id.toString(),
      site_id: item?.id.toString(),
      cleaner_user_id: item?.cleaner_user_id.toString(),
    }));

    // Trigger AI scoring for AFTER photos

    const data = await axios.post(
      "https://pugarch-c-score-369586418873.europe-west1.run.app/predict",
      (data = {
        images: beforePhotos,
      })
    );
    const res = await prisma.hygiene_scores.create({
      data: {
        location_id: review.site_id,
        score: simulatedScore,
        details: { ai_status: "success" },
        image_url: `http://your-image-host.com/uploads/${filename}`,
        inspected_at: new Date(),
        created_by: review.cleaner_user_id,
      },
    });

    res.json({ status: "success", data: serializedData });
  } catch (err) {
    res.status(400).json({ status: "error", detail: err.message });
  }
}
