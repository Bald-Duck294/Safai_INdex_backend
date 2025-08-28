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
import userRouter from "./routes/userRoutes.js";

const app = express();
app.use(express.json());

// ✅ Correct CORS setup (put before routes)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8100",       // Ionic dev
  "capacitor://localhost",       // Capacitor native
  "ionic://localhost",           // Ionic native
  "https://localhost",           // Ionic native
  "http://localhost",           // Ionic native
  "https://safai-index-frontend.onrender.com", // your frontend (change if needed)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Preflight
app.options("*", cors());

// Routes
app.use("/api", loginRoute);
app.use("/api", verifyToken);

app.use("/api", getLocationRoutes);
app.use("/api", location_types_router);
app.use("/api", configRouter);
app.use("/api/cleaner-reviews", clean_review_Router);
app.use("/api/reviews", reviewRoutes);
app.use("/api", clen_assign_router);
app.use("/api", userRouter);

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Hi there, Your server has successfully started");
});

app.listen(8000, () => {
  console.log("🚀 Server started at port 8000");
});
