import express, { Router } from "express";
import {
  getAllToilets,
  getToiletById,
  getUser
} from "../controller/getDataController.js";

const getRouter = express.Router();

getRouter.get("/getUsers", getUser);
// getRouter.get('/getLocations' , getLocation);
getRouter.get("/locations", getAllToilets);
getRouter.get("/locations/:id", getToiletById);

export default getRouter;
