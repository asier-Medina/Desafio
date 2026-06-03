import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import * as ctrl from "../controllers/culture.controller.js";

const router = Router();

router.get("/museos",        ctrl.museos);
router.get("/patrimonio",    ctrl.patrimonio);
router.get("/visita-guiada", ctrl.visitaGuiada);
router.get("/cerca-de-ti",   ctrl.cercaDeTi);
router.get("/:id", protect,  ctrl.porId);
router.get("/",              ctrl.todos);

export default router;
