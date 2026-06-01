import { events, reviews, categories, users } from "../data/mockData.js";
export function getCategories() { return categories; }
export function getEvents({ categoria, zona } = {}) {
  let result = [...events];
  if (categoria) result = result.filter((e) => e.categoria === categoria);
  if (zona) result = result.filter((e) => e.ubicacion.zona?.toLowerCase() === zona.toLowerCase());
  return result;
}
export function getEventById(id) { return events.find((e) => e.id === id) || null; }
export function getRecommendedEvents() {
  return events.filter((e) => e.destacado)
    .map((e) => ({ ...e, score: +(e.valoracionMedia / 5).toFixed(2) }))
    .sort((a, b) => b.score - a.score);
}
export function getReviewsByEvent(eventId) { return reviews[eventId] || []; }
export function addReview(eventId, { usuario, puntuacion, texto }) {
  const nueva = { id: "rev_" + Date.now(), usuario, puntuacion, texto, fecha: new Date().toISOString() };
  if (!reviews[eventId]) reviews[eventId] = [];
  reviews[eventId].push(nueva);
  return nueva;
}
export function findUserByCredentials(email, password) {
  return users.find((u) => u.email === email && u.password === password) || null;
}
export function getFavorites(userId) {
  const user = users.find((u) => u.id === userId);
  if (!user) return [];
  return user.favoritos.map(getEventById).filter(Boolean);
}
