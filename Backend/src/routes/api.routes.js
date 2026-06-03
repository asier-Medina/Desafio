import { Router } from "express";
//import authRouter from "./routes/auth.routes.js";
//import userRouter from "./routes/user.routes.js";
import gastronomyRouter from "./gastronomy.routes.js";
import cultureRouter from "./culture.routes.js";
import eventsRouter from './events.routes.js';

const router = Router()

//router.get("/auth",  authRouter);
//router.get("/user", userRouter);
router.get("/gastronomy",  gastronomyRouter);
router.get("/culture", cultureRouter);
router.get("/events", eventsRouter);

export default router
