import { Router } from "express";
import { protect, isAdmin } from "../middlewares/auth.js";
import * as ctrl from "../controllers/admin.controller.js";

const router = Router();

router.use(protect, isAdmin);

router.get("/users",           ctrl.getUsers);
router.patch("/users/:id",     ctrl.updateUser);
router.delete("/users/:id",    ctrl.deleteUser);
router.get("/comercios",       ctrl.getComercio);
router.patch("/comercios/:id", ctrl.updateComercio);

export default router;
