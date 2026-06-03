import { Router } from "express";
import { protect, isAdmin } from "../middlewares/auth.js";
import * as ctrl from "../controllers/event.controller.js";

const router = Router();

// Lectura pública
router.get("/esta-semana",            ctrl.estaSemana);
router.get("/fin-de-semana",          ctrl.finDeSemana);
router.get("/cerca-de-ti",            ctrl.cercaDeTi);
router.get("/en-euskera",             ctrl.enEuskera);
router.get("/",                       ctrl.todos);
router.get("/:id",                    ctrl.porId);

// CRUD - solo admin
router.post("/",                      protect, isAdmin, ctrl.crear);
router.put("/:id",                    protect, isAdmin, ctrl.actualizar);
router.delete("/:id",                 protect, isAdmin, ctrl.eliminar);
router.patch("/:id/active",           protect, isAdmin, ctrl.cambiarActive);
router.patch("/:id/sponsored",        protect, isAdmin, ctrl.cambiarSponsored);

export default router;
