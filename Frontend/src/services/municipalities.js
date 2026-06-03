const MUNICIPALITIES = [
  { id: 1, name_es: "Bilbao", name_eu: "Bilbo" },
  { id: 2, name_es: "Donostia-San Sebastián", name_eu: "Donostia" },
  { id: 3, name_es: "Vitoria-Gasteiz", name_eu: "Gasteiz" },
  { id: 4, name_es: "Barakaldo", name_eu: "Barakaldo" },
  { id: 5, name_es: "Getxo", name_eu: "Getxo" },
  { id: 6, name_es: "Irun", name_eu: "Irun" },
  { id: 7, name_es: "Portugalete", name_eu: "Portugalete" },
  { id: 8, name_es: "Santurtzi", name_eu: "Santurtzi" },
  { id: 9, name_es: "Basauri", name_eu: "Basauri" },
  { id: 10, name_es: "Errenteria", name_eu: "Errenteria" },
];

export function getAll(lang = "es") {
  return MUNICIPALITIES.map((m) => ({
    value: m.id,
    label: lang === "eu" ? m.name_eu : m.name_es,
  }));
}

export function getNameById(id, lang = "es") {
  const m = MUNICIPALITIES.find((m) => m.id === id);
  if (!m) return "";
  return lang === "eu" ? m.name_eu : m.name_es;
}
