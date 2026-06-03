import { Router } from "express";
import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import gastronomyRouter from "./gastronomy.routes.js";
import cultureRouter from "./culture.routes.js";
import eventsRouter from './events.routes.js';
import favoriteRouter from './favorite.routes.js';
import reviewRouter from './review.routes.js';

const router = Router()

router.get("/auth",  authRouter);
router.get("/users", userRouter);
router.get("/gastronomy",  gastronomyRouter);
router.get("/culture", cultureRouter);
router.get("/events", eventsRouter);
router.get('/favorites', favoriteRouter)
router.get('/reviews', reviewRouter)

export default router

