import express from "express";

import { getConfiguration } from "../controller/configController.js";

const configRouter = express.Router();

configRouter.get('/configurations/:name' , getConfiguration);

export default configRouter;