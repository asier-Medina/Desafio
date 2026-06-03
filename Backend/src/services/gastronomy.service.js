import axios from "axios";
import { Op } from "sequelize";
import { Gastronomy, Municipality } from "../models/index.js";

const ML_BASE = process.env.ML_API_URL || "http://localhost:5442/api";
const ML_TIMEOUT = parseInt(process.env.ML_TIMEOUT_MS) || 5000;

async function fromML(path) {
  try {
    const { data } = await axios.get(`${ML_BASE}${path}`, { timeout: ML_TIMEOUT });
    if (Array.isArray(data) && data.length > 0) return data;
    if (data?.results?.length > 0) return data.results;
    return null;
  } catch {
    return null;
  }
}

const BASE_WHERE = { active: true };
const include = [{ model: Municipality, attributes: ["nombre", "provincia"] }];

export async function getMejorValorados() {
  const ml = await fromML("/gastronomia/mejor-valorados");
  if (ml) return ml;

  return Gastronomy.findAll({
    where: { ...BASE_WHERE, valoracion: { [Op.not]: null } },
    include,
    order: [["valoracion", "DESC"]],
  });
}

export async function getMichelinRepsol() {
  const ml = await fromML("/gastronomia/michelin-repsol");
  if (ml) return ml;

  return Gastronomy.findAll({
    where: { ...BASE_WHERE, [Op.or]: [{ michelin: true }, { repsol: true }] },
    include,
    order: [["valoracion", "DESC"]],
  });
}

export async function getEntornoEspecial() {
  const ml = await fromML("/gastronomia/entorno-especial");
  if (ml) return ml;

  return Gastronomy.findAll({
    where: { ...BASE_WHERE, entorno: { [Op.not]: null } },
    include,
    order: [["valoracion", "DESC"]],
  });
}

export async function getCercaDeTi(municipalityId) {
  const ml = await fromML("/gastronomia/cerca-de-ti");
  if (ml) return ml;

  return Gastronomy.findAll({
    where: { ...BASE_WHERE, municipality_id: municipalityId },
    include,
    order: [["valoracion", "DESC"]],
  });
}

export async function getGastronomiaById(id) {
  return Gastronomy.findOne({ where: { id, ...BASE_WHERE }, include });
}


export async function getAllGastronomia() {
  const ml = await fromML("/gastronomia");
  if (ml) return ml;

  return Gastronomy.findAll({
    where: BASE_WHERE,
    include,
    order: [["valoracion", "DESC"]],
  });
}
