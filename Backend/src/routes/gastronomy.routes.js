import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import * as ctrl from "../controllers/gastronomy.controller.js";

const router = Router();

router.get("/mejor-valorados",  ctrl.mejorValorados);
router.get("/michelin-repsol",  ctrl.michelinRepsol);
router.get("/entorno-especial", ctrl.entornoEspecial);
router.get("/cerca-de-ti",      ctrl.cercaDeTi);
router.get("/:id", protect,     ctrl.porId);
router.get("/",                 ctrl.todos);

export default router;
