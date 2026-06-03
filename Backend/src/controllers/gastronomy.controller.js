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

export const crear           = async (req, res) => {
  try { res.status(201).json(await gastronomyService.createGastronomia(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
};

export const actualizar      = async (req, res) => {
  try {
    const item = await gastronomyService.updateGastronomia(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Establecimiento no encontrado" });
    res.json(item);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const eliminar        = async (req, res) => {
  try {
    const item = await gastronomyService.deleteGastronomia(req.params.id);
    if (!item) return res.status(404).json({ error: "Establecimiento no encontrado" });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

export const cambiarActive   = async (req, res) => {
  try {
    const item = await gastronomyService.toggleActive(req.params.id);
    if (!item) return res.status(404).json({ error: "Establecimiento no encontrado" });
    res.json({ id: item.id, active: item.active });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

export const cambiarSponsored = async (req, res) => {
  try {
    const item = await gastronomyService.toggleSponsored(req.params.id);
    if (!item) return res.status(404).json({ error: "Establecimiento no encontrado" });
    res.json({ id: item.id, is_sponsored: item.is_sponsored });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

