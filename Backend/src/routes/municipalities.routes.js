import { Router } from "express";
import { Municipality } from "../models/index.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const municipalities = await Municipality.findAll({
      attributes: ["id", "nombre", "provincia"],
      order: [["provincia", "ASC"], ["nombre", "ASC"]],
    });
    res.json(municipalities);
  } catch (err) {
    next(err);
  }
});

export default router;
