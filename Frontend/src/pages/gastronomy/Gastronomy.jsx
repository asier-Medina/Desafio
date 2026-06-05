import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Card from "@shared/components/Cards/Card";
import CategorySection from "@shared/components/Section/CategorySection";
import * as gastronomyApi from "@services/gastronomy.api";
import "../events/Events.css";

const filterMap = {
  destacados: (items) => items,
  "mejor-valorados": (items) => [...items].sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0)),
};

export default function Gastronomy() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [mejorValorados, setMejorValorados] = useState([]);
  const [cercaDeTi, setCercaDeTi] = useState([]);
  const [loading, setLoading] = useState(true);

  const showAll = searchParams.get("show") === "all";
  const filter = searchParams.get("filter");

  useEffect(() => {
    Promise.all([
      gastronomyApi.list(),
      gastronomyApi.getFeatured(),
      gastronomyApi.getMejorValorados(),
      gastronomyApi.getCercaDeTi(),
    ])
      .then(([all, feat, best, cerca]) => {
        setRestaurants(all);
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
        variant="gastronomy"
        data={data}
        lang="es"
        onAction={(d) => navigate(`/gastronomy/${d.id}`)}
      />
    );
  }

  if (loading) return <p className="p-8">Cargando gastronomía...</p>;

  if (showAll && filter) {
    let items;
    if (filter === "cerca-de-ti") {
      items = cercaDeTi;
    } else if (filter === "destacados") {
      items = destacados;
    } else if (filter === "mejor-valorados") {
      items = mejorValorados;
    } else {
      items = restaurants;
    }
    if (filterMap[filter]) items = filterMap[filter](items);
    return (
      <div className="events container">
        <h1 className="events__title">Gastronomía</h1>
        <div className="events__grid">
          {items.length === 0 ? (
            <p className="events__empty">No hay resultados.</p>
          ) : (
            items.map((r) => (
              <div className="events__item" key={r.id}>
                <Card
                  variant="gastronomy"
                  data={r}
                  lang="es"
                  onAction={(d) => navigate(`/gastronomy/${d.id}`)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const secciones = [
    { id: "todos", title: "Todos", to: "/gastronomy", items: restaurants },
    { id: "destacados", title: "Destacados", to: "/gastronomy?show=all&filter=destacados", items: destacados },
    { id: "mejor-valorados", title: "Mejor valorados", to: "/gastronomy?show=all&filter=mejor-valorados", items: mejorValorados },
    { id: "cerca-de-ti", title: "Cerca de ti", to: "/gastronomy?show=all&filter=cerca-de-ti", items: cercaDeTi },
  ];

  return (
    <div className="events container">
      <h1 className="events__title">Gastronomía</h1>
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
