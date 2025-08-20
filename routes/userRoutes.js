import express from 'express';
// import { getUser } from '../controller/getDataController.js';
import { getUser } from '../controller/userController.js';

const userRouter = express.Router();


userRouter.get('/users', getUser);

export default userRouter;