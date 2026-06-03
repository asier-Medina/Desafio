import { Router } from "express";
import authRouter       from "./auth.routes.js";
import userRouter       from "./user.routes.js";
import gastronomyRouter from "./gastronomy.routes.js";
import cultureRouter    from "./culture.routes.js";
import eventsRouter     from './events.routes.js';
import favoriteRouter   from './favorite.routes.js';
import reviewRouter     from './review.routes.js';

const router = Router()

router.use("/auth",            authRouter)
router.use("/users",           userRouter)
router.use("/gastronomy",      gastronomyRouter)
router.use("/culture",         cultureRouter)
router.use("/events",          eventsRouter)
router.use("/users/me/favorites", favoriteRouter)
router.use("/reviews",         reviewRouter)

export default router