import { Router } from "express";
import { protect, isAdmin } from "../middlewares/auth.js";
import * as ctrl from "../controllers/gastronomy.controller.js";

const router = Router();

// Lectura pública
router.get("/mejor-valorados",        ctrl.mejorValorados);
router.get("/michelin-repsol",        ctrl.michelinRepsol);
router.get("/entorno-especial",       ctrl.entornoEspecial);
router.get("/cerca-de-ti",            ctrl.cercaDeTi);
router.get("/",                       ctrl.todos);
router.get("/:id",                    ctrl.porId);

// CRUD - solo admin
router.post("/",                      protect, isAdmin, ctrl.crear);
router.put("/:id",                    protect, isAdmin, ctrl.actualizar);
router.delete("/:id",                 protect, isAdmin, ctrl.eliminar);
router.patch("/:id/active",           protect, isAdmin, ctrl.cambiarActive);
router.patch("/:id/sponsored",        protect, isAdmin, ctrl.cambiarSponsored);

export default router;
