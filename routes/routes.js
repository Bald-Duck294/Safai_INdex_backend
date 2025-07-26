import express, { Router } from "express";
import {
  getAllToilets,
  getToiletById,
  getUser,
  createLocation,
  getZonesWithToilets
} from "../controller/getDataController.js";

const getRouter = express.Router();

getRouter.get("/getUsers", getUser);
// getRouter.get('/getLocations' , getLocation);
getRouter.get("/locations", getAllToilets);
getRouter.post("/locations", createLocation);
getRouter.get("/locations/:id", getToiletById);
getRouter.get("/zones", getZonesWithToilets);

export default getRouter;
