import axios from "axios";
import { Op } from "sequelize";
import { Culture, Municipality } from "../models/index.js";

const ML_BASE = process.env.ML_API_URL || "http://localhost:5442/api";
const ML_TIMEOUT = parseInt(process.env.ML_TIMEOUT_MS) || 5000;

async function fromML(path) {
  try {
    const { data } = await axios.get(`${ML_BASE}${path}`, { timeout: ML_TIMEOUT });
    const payload = data?.data ?? data;
    if (Array.isArray(payload) && payload.length > 0) return payload;
    if (payload?.results?.length > 0) return payload.results;
    return null;
  } catch {
    return null;
  }
}

const BASE_WHERE = { active: true };
const include = [{ model: Municipality, attributes: ["nombre", "provincia"] }];

const MUSEO_TIPOS = ["Museo", "museo", "Museos"];
const PATRIMONIO_TIPOS = ["Patrimonio", "patrimonio", "Patrimonio Cultural", "Monumento", "monumento"];

export async function getAllCultura() {
  const ml = await fromML("/cultura");
  if (ml) return ml;

  return Culture.findAll({
    where: BASE_WHERE,
    include,
    order: [["valoracion", "DESC"]],
  });
}

export async function getMuseos() {
  const ml = await fromML("/cultura/museos");
  if (ml) return ml;

  return Culture.findAll({
    where: { ...BASE_WHERE, tipo_lugar: { [Op.in]: MUSEO_TIPOS } },
    include,
    order: [["valoracion", "DESC"]],
  });
}

export async function getPatrimonio() {
  const ml = await fromML("/cultura/patrimonio");
  if (ml) return ml;

  return Culture.findAll({
    where: { ...BASE_WHERE, tipo_lugar: { [Op.in]: PATRIMONIO_TIPOS } },
    include,
    order: [["valoracion", "DESC"]],
  });
}

export async function getVisitaGuiada() {
  const ml = await fromML("/cultura/visita-guiada");
  if (ml) return ml;

  return Culture.findAll({
    where: { ...BASE_WHERE, visita_guiada: true },
    include,
    order: [["valoracion", "DESC"]],
  });
}

export async function getCercaDeTi(municipalityId) {
  const ml = await fromML(`/cultura/cerca-de-ti?municipality_id=${municipalityId}`);
  if (ml) return ml;

  return Culture.findAll({
    where: { ...BASE_WHERE, municipality_id: municipalityId },
    include,
    order: [["valoracion", "DESC"]],
  });
}

export async function getCulturaById(id) {
  return Culture.findOne({ where: { id }, include });
}

export async function createCultura(data) {
  return Culture.create(data);
}

export async function updateCultura(id, data) {
  const item = await Culture.findByPk(id);
  if (!item) return null;
  return item.update(data);
}

export async function deleteCultura(id) {
  const item = await Culture.findByPk(id);
  if (!item) return null;
  await item.destroy();
  return item;
}

export async function toggleActive(id) {
  const item = await Culture.findByPk(id);
  if (!item) return null;
  return item.update({ active: !item.active });
}

export async function toggleSponsored(id) {
  const item = await Culture.findByPk(id);
  if (!item) return null;
  return item.update({ is_sponsored: !item.is_sponsored });
}
