import axios from "axios";
import { Op } from "sequelize";
import { Event, Municipality } from "../models/index.js";

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

function startOfWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay() + 1); // lunes
  return d;
}

function endOfWeek() {
  const d = startOfWeek();
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function nextWeekendRange() {
  const now = new Date();
  const day = now.getDay(); // 0=dom, 6=sab
  const daysToSat = (6 - day + 7) % 7 || 7;
  const sat = new Date(now);
  sat.setDate(now.getDate() + daysToSat);
  sat.setHours(0, 0, 0, 0);
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);
  sun.setHours(23, 59, 59, 999);
  return { sat, sun };
}

const BASE_WHERE = { active: true };
const include = [{ model: Municipality, attributes: ["nombre", "provincia"] }];

export async function getAllEventos() {
  const ml = await fromML("/eventos");
  if (ml) return ml;

  return Event.findAll({
    where: BASE_WHERE,
    include,
    order: [["start_date", "ASC"]],
  });
}

export async function getEstaSemana() {
  const ml = await fromML("/eventos/esta-semana");
  if (ml) return ml;

  return Event.findAll({
    where: { ...BASE_WHERE, start_date: { [Op.between]: [startOfWeek(), endOfWeek()] } },
    include,
    order: [["start_date", "ASC"]],
  });
}

export async function getFinDeSemana() {
  const ml = await fromML("/eventos/fin-de-semana");
  if (ml) return ml;

  const { sat, sun } = nextWeekendRange();
  return Event.findAll({
    where: { ...BASE_WHERE, start_date: { [Op.between]: [sat, sun] } },
    include,
    order: [["start_date", "ASC"]],
  });
}

export async function getCercaDeTi(municipalityId) {
  const ml = await fromML(`/eventos/cerca-de-ti?municipality_id=${municipalityId}`);
  if (ml) return ml;

  return Event.findAll({
    where: { ...BASE_WHERE, municipality_id: municipalityId },
    include,
    order: [["start_date", "ASC"]],
  });
}

export async function getEnEuskera() {
  const ml = await fromML("/eventos/en-euskera");
  if (ml) return ml;

  return Event.findAll({
    where: { ...BASE_WHERE, language: { [Op.iLike]: "eu%" } },
    include,
    order: [["start_date", "ASC"]],
  });
}

export async function getEventoById(id) {
  return Event.findOne({ where: { id }, include });
}

export async function createEvento(data) {
  return Event.create(data);
}

export async function updateEvento(id, data) {
  const event = await Event.findByPk(id);
  if (!event) return null;
  return event.update(data);
}

export async function deleteEvento(id) {
  const event = await Event.findByPk(id);
  if (!event) return null;
  await event.destroy();
  return event;
}

export async function toggleActive(id) {
  const event = await Event.findByPk(id);
  if (!event) return null;
  return event.update({ active: !event.active });
}

export async function toggleSponsored(id) {
  const event = await Event.findByPk(id);
  if (!event) return null;
  return event.update({ is_sponsored: !event.is_sponsored });
}
