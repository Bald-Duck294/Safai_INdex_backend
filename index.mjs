import express from "express";
import cors from "cors";
import { verifyToken } from "./utils/jwt.js";

import getLocationRoutes from "./routes/LocationRoutes.js";
import location_types_router from "./routes/locationTypes.js";
import configRouter from "./routes/configRoutes.js";
import clean_review_Router from "./routes/CleanerReviewRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import loginRoute from "./routes/loginApi.js";
import clen_assign_router from "./routes/clen_assignRoutes.js";
// import { loginUser } from "./controller/authController.js";

const app = express();
app.use(express.json());
app.use(cors());

// app.use("/api", loginRoute11);
// 🔑 Protect all /api routes
app.use("/api", loginRoute);

app.use("/api", verifyToken);

// Routes
app.use("/api", getLocationRoutes);
app.use("/api", location_types_router);
app.use("/api", configRouter);
app.use("/api/cleaner-reviews", clean_review_Router);
app.use("/api/reviews", reviewRoutes);
app.use("/api", clen_assign_router);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Hi there, Your server has successfully started");
});

app.listen(8000, () => {
  console.log("Your server started at port 8000");
  // console.log("Your constant token:", generateToken()); // print it for Postman
});
