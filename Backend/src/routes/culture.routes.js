import { Router } from "express";
import { protect, isAdmin } from "../middlewares/auth.js";
import * as ctrl from "../controllers/culture.controller.js";

const router = Router();

// Lectura pública
router.get("/museos",                    ctrl.museos);
router.get("/patrimonio",                ctrl.patrimonio);
router.get("/visita-guiada",             ctrl.visitaGuiada);
router.get("/cerca-de-ti",               ctrl.cercaDeTi);
router.get("/",                          ctrl.todos);
router.get("/:id",                       ctrl.porId);

// CRUD - solo admin
router.post("/",                         protect, isAdmin, ctrl.crear);
router.put("/:id",                       protect, isAdmin, ctrl.actualizar);
router.delete("/:id",                    protect, isAdmin, ctrl.eliminar);
router.patch("/:id/active",              protect, isAdmin, ctrl.cambiarActive);
router.patch("/:id/sponsored",           protect, isAdmin, ctrl.cambiarSponsored);

export default router;
