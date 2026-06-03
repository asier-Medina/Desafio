import * as cultureService from "../services/culture.service.js";

export const museos         = async (req, res) => {
  try { res.json(await cultureService.getMuseos()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

export const patrimonio     = async (req, res) => {
  try { res.json(await cultureService.getPatrimonio()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

export const visitaGuiada   = async (req, res) => {
  try { res.json(await cultureService.getVisitaGuiada()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

export const cercaDeTi      = async (req, res) => {
  const municipalityId = req.user?.municipality_id ?? req.query.municipality_id;
  if (!municipalityId)
    return res.status(400).json({ error: "Se requiere municipality_id" });
  try { res.json(await cultureService.getCercaDeTi(municipalityId)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

export const todos          = async (req, res) => {
  try { res.json(await cultureService.getAllCultura()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

export const porId          = async (req, res) => {
  try {
    const item = await cultureService.getCulturaById(req.params.id);
    if (!item) return res.status(404).json({ error: "Lugar cultural no encontrado" });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
