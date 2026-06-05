import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Card from "@shared/components/Cards/Card";
import CategorySection from "@shared/components/Section/CategorySection";
import * as cultureApi from "@services/culture.api";
import "../events/Events.css";

const filterMap = {
  destacados: (items) => items,
  "mejor-valorados": (items) => [...items].sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0)),
};

export default function Culture() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [places, setPlaces] = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [mejorValorados, setMejorValorados] = useState([]);
  const [cercaDeTi, setCercaDeTi] = useState([]);
  const [loading, setLoading] = useState(true);

  const showAll = searchParams.get("show") === "all";
  const filter = searchParams.get("filter");

  useEffect(() => {
    Promise.all([
      cultureApi.list(),
      cultureApi.getFeatured(),
      cultureApi.getMejorValorados(),
      cultureApi.getCercaDeTi(),
    ])
      .then(([all, feat, best, cerca]) => {
        setPlaces(all);
        setDestacados(feat);
        setMejorValorados(best);
        setCercaDeTi(cerca);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function renderCard(data) {
    return (
      <Card
        variant="culture"
        data={data}
        lang="es"
        onAction={(d) => navigate(`/culture/${d.id}`)}
      />
    );
  }

  if (loading) return <p className="p-8">Cargando cultura...</p>;

  if (showAll && filter) {
    let items;
    if (filter === "cerca-de-ti") {
      items = cercaDeTi;
    } else if (filter === "destacados") {
      items = destacados;
    } else if (filter === "mejor-valorados") {
      items = mejorValorados;
    } else {
      items = places;
    }
    if (filterMap[filter]) items = filterMap[filter](items);
    return (
      <div className="events container">
        <h1 className="events__title">Cultura</h1>
        <div className="events__grid">
          {items.length === 0 ? (
            <p className="events__empty">No hay resultados.</p>
          ) : (
            items.map((p) => (
              <div className="events__item" key={p.id}>
                <Card
                  variant="culture"
                  data={p}
                  lang="es"
                  onAction={(d) => navigate(`/culture/${d.id}`)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const secciones = [
    { id: "todos", title: "Todos", to: "/culture", items: places },
    { id: "destacados", title: "Destacados", to: "/culture?show=all&filter=destacados", items: destacados },
    { id: "mejor-valorados", title: "Mejor valorados", to: "/culture?show=all&filter=mejor-valorados", items: mejorValorados },
    { id: "cerca-de-ti", title: "Cerca de ti", to: "/culture?show=all&filter=cerca-de-ti", items: cercaDeTi },
  ];

  return (
    <div className="events container">
      <h1 className="events__title">Cultura</h1>
      {secciones.map((s) => (
        <CategorySection
          key={s.id}
          title={s.title}
          seeAllTo={s.to}
          items={s.items}
          renderCard={renderCard}
        />
      ))}
    </div>
  );
}
