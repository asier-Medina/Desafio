import * as eventService from "../services/event.service.js";

export const estaSemana   = async (req, res) => {
  try { res.json(await eventService.getEstaSemana()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

export const finDeSemana  = async (req, res) => {
  try { res.json(await eventService.getFinDeSemana()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

export const cercaDeTi    = async (req, res) => {
  const municipalityId = req.user?.municipality_id ?? req.query.municipality_id;
  if (!municipalityId)
    return res.status(400).json({ error: "Se requiere municipality_id" });
  try { res.json(await eventService.getCercaDeTi(municipalityId)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

export const enEuskera    = async (req, res) => {
  try { res.json(await eventService.getEnEuskera()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

export const todos        = async (req, res) => {
  try { res.json(await eventService.getAllEventos()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

export const porId        = async (req, res) => {
  try {
    const item = await eventService.getEventoById(req.params.id);
    if (!item) return res.status(404).json({ error: "Evento no encontrado" });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

export const crear        = async (req, res) => {
  try { res.status(201).json(await eventService.createEvento(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
};

export const actualizar   = async (req, res) => {
  try {
    const item = await eventService.updateEvento(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Evento no encontrado" });
    res.json(item);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const eliminar     = async (req, res) => {
  try {
    const item = await eventService.deleteEvento(req.params.id);
    if (!item) return res.status(404).json({ error: "Evento no encontrado" });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

export const cambiarActive     = async (req, res) => {
  try {
    const item = await eventService.toggleActive(req.params.id);
    if (!item) return res.status(404).json({ error: "Evento no encontrado" });
    res.json({ id: item.id, active: item.active });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

export const cambiarSponsored  = async (req, res) => {
  try {
    const item = await eventService.toggleSponsored(req.params.id);
    if (!item) return res.status(404).json({ error: "Evento no encontrado" });
    res.json({ id: item.id, is_sponsored: item.is_sponsored });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

