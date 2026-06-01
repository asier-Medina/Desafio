import { Router } from "express";
import { getEvents, getEventById, getRecommendedEvents, getReviewsByEvent, addReview, getCategories } from "../services/eventService.js";

const router = Router();
router.get("/categories", (req, res) => res.json(getCategories()));

router.get("/events", (req, res) => {
  const { categoria, zona } = req.query;
  res.json(getEvents({ categoria, zona }));
});

router.get("/events/recommended", (req, res) => res.json(getRecommendedEvents()));

router.get("/events/:id", (req, res) => {
  const event = getEventById(req.params.id);
  if (!event) return res.status(404).json({ error: "Evento no encontrado" });
  res.json(event);
});

router.get("/events/:id/reviews", (req, res) => res.json(getReviewsByEvent(req.params.id)));

router.post("/events/:id/reviews", (req, res) => {
  const { usuario, puntuacion, texto } = req.body;
  if (!usuario || !puntuacion || !texto)
    return res.status(400).json({ error: "Faltan campos: usuario, puntuacion, texto" });
  res.status(201).json(addReview(req.params.id, { usuario, puntuacion, texto }));
});

export default router;
