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
