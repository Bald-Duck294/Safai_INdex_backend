
import express from 'express';
import prisma from "../config/prismaClient.mjs";
import multer from "multer";



export async function getCleanerReview  (req, res)  {
  console.log("request made");

  const { cleaner_user_id } = req.query;

  try {
    const whereClause = cleaner_user_id
      ? { cleaner_user_id: BigInt(cleaner_user_id) }
      : {};

    const reviews = await prisma.cleaner_review.findMany({
      where: whereClause,
    });

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
};


export const getCleanerReviewsById = async (req, res) => {
    console.log('here');
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

    res.json(serialized);
  } catch (err) {
    console.error("Fetch Reviews by ID Error:", err);
    res.status(500).json({
      error: "Failed to fetch cleaner reviews by ID",
      detail: err,
    });
  }
};
// POST a new review
export  async function createCleanerReview  (req, res)  {
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
      task_ids,
    } = req.body;

    const parsedTaskIds = Array.isArray(task_ids)
      ? task_ids.map(Number)
      : task_ids
      ? task_ids.split(",").map((id) => Number(id.trim()))
      : [];

    const imageFilenames = req.files.map((file) => file.filename);

    const review = await prisma.cleaner_review.create({
      data: {
        name,
        phone,
        site_id: BigInt(site_id || 1),
        user_id: BigInt(user_id || 1),
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
      detail: err,
    });
  }
};

