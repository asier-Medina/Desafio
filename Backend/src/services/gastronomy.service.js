import axios from "axios";
import { Op } from "sequelize";
import { Gastronomy, Municipality } from "../models/index.js";

const ML_BASE    = process.env.ML_API_URL || "http://localhost:5442/api";
const ML_TIMEOUT = parseInt(process.env.ML_TIMEOUT_MS) || 5000;

async function fromML(path) {
  const url = `${ML_BASE}${path}`;
  try {
    const { data } = await axios.get(url, { timeout: ML_TIMEOUT });
    const payload = data?.data ?? data;
    if (Array.isArray(payload) && payload.length > 0) return payload;
    return null;
  } catch {
    return null;
  }
}

const BASE_WHERE = { active: true };
const include    = [{ model: Municipality, attributes: ["nombre", "provincia"] }];

export async function getAllGastronomia() {
  const ml = await fromML("/gastronomia?limit=9999");
  if (ml) return ml;

  return Gastronomy.findAll({
    where: BASE_WHERE,
    include,
    order: [["valoracion", "DESC"]],
  });
}

export async function getMejorValorados() {
  const ml = await fromML("/gastronomia/mejor-valorados?limit=9999");
  if (ml) return ml;

  return Gastronomy.findAll({
    where: { ...BASE_WHERE, valoracion: { [Op.not]: null } },
    include,
    order: [["valoracion", "DESC"]],
  });
}

export async function getMichelinRepsol() {
  const ml = await fromML("/gastronomia/michelin-repsol?limit=9999");
  if (ml) return ml;

  // Fallback: todos activos ordenados por valoración
  return Gastronomy.findAll({
    where: BASE_WHERE,
    include,
    order: [["valoracion", "DESC"]],
  });
}

export async function getEntornoEspecial() {
  const ml = await fromML("/gastronomia/entorno-especial?limit=9999");
  if (ml) return ml;

  return Gastronomy.findAll({
    where: { ...BASE_WHERE, entorno: { [Op.not]: null } },
    include,
    order: [["valoracion", "DESC"]],
  });
}

const BILBAO_ID = 48020;

export async function getCercaDeTi(municipalityId) {
  const targetId = municipalityId || BILBAO_ID;

  // 1. Intentar Flask con el municipio solicitado
  const ml = await fromML(`/gastronomia/cerca-de-ti?municipality_id=${targetId}&limit=9999`);
  if (ml) return ml;

  // 2. Fallback Sequelize con el municipio solicitado
  const items = await Gastronomy.findAll({
    where: { ...BASE_WHERE, municipality_id: targetId },
    include,
    order: [["valoracion", "DESC"]],
  });
  if (items.length > 0) return items;

  // 3. Sin resultados → devolver Bilbao como fallback
  if (targetId !== BILBAO_ID) {
    const mlBilbao = await fromML(`/gastronomia/cerca-de-ti?municipality_id=${BILBAO_ID}&limit=9999`);
    if (mlBilbao) return mlBilbao;
    return Gastronomy.findAll({
      where: { ...BASE_WHERE, municipality_id: BILBAO_ID },
      include,
      order: [["valoracion", "DESC"]],
    });
  }

  return [];
}

export async function getGastronomiaById(id) {
  return Gastronomy.findOne({ where: { id }, include });
}

export async function createGastronomia(data) {
  return Gastronomy.create(data);
}

export async function updateGastronomia(id, data) {
  const item = await Gastronomy.findByPk(id);
  if (!item) return null;
  return item.update(data);
}

export async function deleteGastronomia(id) {
  const item = await Gastronomy.findByPk(id);
  if (!item) return null;
  await item.destroy();
  return item;
}

export async function toggleActive(id) {
  const item = await Gastronomy.findByPk(id);
  if (!item) return null;
  return item.update({ active: !item.active });
}

export async function toggleSponsored(id) {
  const item = await Gastronomy.findByPk(id);
  if (!item) return null;
  return item.update({ is_sponsored: !item.is_sponsored });
}
