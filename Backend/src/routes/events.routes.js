import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import * as ctrl from "../controllers/event.controller.js";

const router = Router();

router.get("/esta-semana",   ctrl.estaSemana);
router.get("/fin-de-semana", ctrl.finDeSemana);
router.get("/cerca-de-ti",   ctrl.cercaDeTi);
router.get("/en-euskera",    ctrl.enEuskera);
router.get("/:id",protect,   ctrl.porId);
router.get("/",              ctrl.todos);

export default router;
