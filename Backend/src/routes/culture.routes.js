import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import * as ctrl from "../controllers/culture.controller.js";

const router = Router();

router.get("/cultura/museos",        ctrl.museos);
router.get("/cultura/patrimonio",    ctrl.patrimonio);
router.get("/cultura/visita-guiada", ctrl.visitaGuiada);
router.get("/cultura/cerca-de-ti",   protect, ctrl.cercaDeTi);
router.get("/cultura/:id",           ctrl.porId);
router.get("/cultura",               ctrl.todos);

export default router;
