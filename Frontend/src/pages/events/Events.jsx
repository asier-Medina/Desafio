import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Card from "@shared/components/Cards/Card";
import CategorySection from "@shared/components/Section/CategorySection";
import * as eventsApi from "@services/events.api";
import "./Events.css";

function isThisWeek(dateStr) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  const d = new Date(dateStr);
  return d >= startOfWeek && d <= endOfWeek;
}

function isWeekend(dateStr) {
  const d = new Date(dateStr);
  return d.getDay() === 6 || d.getDay() === 0;
}

function isThisWeekend(dateStr) {
  if (!isWeekend(dateStr)) return false;
  return isThisWeek(dateStr);
}

function isEuskera(item) {
  return item.language === "EU" || item.idioma === "EU";
}

const filterMap = {
  "esta-semana": (items) => items.filter((i) => i.start_date && isThisWeek(i.start_date)),
  "fin-de-semana": (items) => items.filter((i) => i.start_date && isThisWeekend(i.start_date)),
  "en-euskera": (items) => items.filter(isEuskera),
};

export default function Events() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [cercaDeTi, setCercaDeTi] = useState([]);
  const [loading, setLoading] = useState(true);

  const showAll = searchParams.get("show") === "all";
  const filter = searchParams.get("filter");

  useEffect(() => {
    Promise.all([
      eventsApi.list(),
      eventsApi.getCercaDeTi(),
    ])
      .then(([all, cerca]) => {
        setEvents(all);
        setCercaDeTi(cerca);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8">Cargando eventos...</p>;

  if (showAll && filter) {
    let items;
    if (filter === "cerca-de-ti") {
      items = cercaDeTi;
    } else if (filterMap[filter]) {
      items = filterMap[filter](events);
    } else {
      items = events;
    }
    return (
      <div className="events container">
        <h1 className="events__title">Eventos</h1>
        <div className="events__grid">
          {items.length === 0 ? (
            <p className="events__empty">No hay eventos.</p>
          ) : (
            items.map((event) => (
              <div className="events__item" key={event.id}>
                <Card
                  variant="event"
                  data={event}
                  lang="es"
                  onAction={(d) => navigate(`/events/${d.id}`)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const secciones = [
    { id: "todos", title: "Todos los eventos", to: "/events", items: events },
    {
      id: "esta-semana",
      title: "Esta semana",
      to: "/events?show=all&filter=esta-semana",
      items: events.filter((i) => i.start_date && isThisWeek(i.start_date)),
    },
    {
      id: "fin-de-semana",
      title: "Fin de semana",
      to: "/events?show=all&filter=fin-de-semana",
      items: events.filter((i) => i.start_date && isThisWeekend(i.start_date)),
    },
    {
      id: "cerca-de-ti",
      title: "Cerca de ti",
      to: "/events?show=all&filter=cerca-de-ti",
      items: cercaDeTi,
    },
    {
      id: "en-euskera",
      title: "En euskera",
      to: "/events?show=all&filter=en-euskera",
      items: events.filter(isEuskera),
    },
  ];

  return (
    <div className="events container">
      <h1 className="events__title">Eventos</h1>
      {secciones.map((s) => (
        <CategorySection
          key={s.id}
          title={s.title}
          seeAllTo={s.to}
          items={s.items}
          renderCard={(data) => (
            <Card
              variant="event"
              data={data}
              lang="es"
              onAction={(d) => navigate(`/events/${d.id}`)}
            />
          )}
        />
      ))}
    </div>
  );
}
