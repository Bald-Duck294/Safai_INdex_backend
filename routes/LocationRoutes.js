import express, { Router } from "express";
import {
  getAllToilets,
  getToiletById,
  getUser,
  createLocation,
  getZonesWithToilets
} from "../controller/getDataController.js";

const getLocationRoutes = express.Router();

getLocationRoutes.get("/getUsers", getUser);
// getLocationRoutes.get('/getLocations' , getLocation);
getLocationRoutes.get("/locations", getAllToilets);
getLocationRoutes.post("/locations", createLocation);
getLocationRoutes.get("/locations/:id", getToiletById);
getLocationRoutes.get("/zones", getZonesWithToilets);

export default getLocationRoutes;
