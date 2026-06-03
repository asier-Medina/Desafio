import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import * as ctrl from "../controllers/gastronomy.controller.js";

const router = Router();

router.get("/gastronomia/mejor-valorados",  ctrl.mejorValorados);
router.get("/gastronomia/michelin-repsol",  ctrl.michelinRepsol);
router.get("/gastronomia/entorno-especial", ctrl.entornoEspecial);
router.get("/gastronomia/cerca-de-ti",      protect, ctrl.cercaDeTi);
router.get("/gastronomia/:id",              ctrl.porId);
router.get("/gastronomia",                  ctrl.todos);

export default router;
