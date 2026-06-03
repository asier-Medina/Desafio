import * as gastronomyService from "../services/gastronomy.service.js";

export const mejorValorados  = async (req, res) => {
  try { res.json(await gastronomyService.getMejorValorados()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

export const michelinRepsol  = async (req, res) => {
  try { res.json(await gastronomyService.getMichelinRepsol()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

export const entornoEspecial = async (req, res) => {
  try { res.json(await gastronomyService.getEntornoEspecial()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

export const cercaDeTi       = async (req, res) => {
  const municipalityId = req.user?.municipality_id ?? req.query.municipality_id;
  if (!municipalityId)
    return res.status(400).json({ error: "Se requiere municipality_id" });
  try { res.json(await gastronomyService.getCercaDeTi(municipalityId)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

export const todos           = async (req, res) => {
  try { res.json(await gastronomyService.getAllGastronomia()); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

export const porId           = async (req, res) => {
  try {
    const item = await gastronomyService.getGastronomiaById(req.params.id);
    if (!item) return res.status(404).json({ error: "Establecimiento no encontrado" });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
