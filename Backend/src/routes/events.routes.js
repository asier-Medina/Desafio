import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import * as ctrl from "../controllers/events.controller.js";

const router = Router();

router.get("/eventos/esta-semana",  ctrl.estaSemana);
router.get("/eventos/fin-de-semana", ctrl.finDeSemana);
router.get("/eventos/cerca-de-ti",  protect, ctrl.cercaDeTi);
router.get("/eventos/en-euskera",   ctrl.enEuskera);
router.get("/eventos/:id",          ctrl.porId);
router.get("/eventos",              ctrl.todos);

export default router;
