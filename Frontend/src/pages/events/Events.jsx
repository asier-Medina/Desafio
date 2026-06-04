import { useNavigate } from "react-router";
import Card from "@shared/components/Cards/Card";
import CategorySection from "@shared/components/Section/CategorySection";
import "./Events.css";

export default function Events() {
  const navigate = useNavigate();

  const secciones = [
    { id: "todos", title: "Todos los eventos", to: "/events?filter=todos", items: EVENTOS_DEMO },
    { id: "esta-semana", title: "Esta semana", to: "/events?filter=esta-semana", items: EVENTOS_DEMO },
    { id: "fin-de-semana", title: "Fin de semana", to: "/events?filter=fin-de-semana", items: EVENTOS_DEMO },
    { id: "cerca-de-ti", title: "Cerca de ti", to: "/events?filter=cerca-de-ti", items: EVENTOS_DEMO },
    { id: "en-euskera", title: "En euskera", to: "/events?filter=en-euskera", items: EVENTOS_DEMO },
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

const EVENTOS_DEMO = [
  {
    id: 1,
    nombre: "Concierto de Kalakan",
    type: "Concierto",
    start_date: "2026-06-05T20:00:00Z",
    end_date: "2026-06-05T22:30:00Z",
    establishment: "Teatro Arriaga",
    place: "Bilbao",
    language: "EU",
    municipality_id: 1,
    active: true,
  },
  {
    id: 2,
    nombre: "Feria del libro",
    type: "Feria",
    start_date: "2026-06-06T10:00:00Z",
    end_date: "2026-06-06T20:00:00Z",
    establishment: "Plaza Nueva",
    place: "Bilbao",
    language: "ES",
    municipality_id: 1,
    active: true,
  },
  {
    id: 3,
    nombre: "Bertso saioa",
    type: "Bertsolarismo",
    start_date: "2026-06-06T18:00:00Z",
    end_date: "2026-06-06T20:00:00Z",
    establishment: "Kafe Antzokia",
    place: "Bilbao",
    language: "EU",
    municipality_id: 1,
    active: true,
  },
  {
    id: 4,
    nombre: "Exposición de fotografía contemporánea",
    type: "Exposición",
    start_date: "2026-06-07T11:00:00Z",
    end_date: "2026-07-15T20:00:00Z",
    establishment: "Azkuna Zentroa",
    place: "Bilbao",
    language: "ES",
    municipality_id: 1,
    active: true,
  },
  {
    id: 5,
    nombre: "Danza contemporánea: Aterpe",
    type: "Danza",
    start_date: "2026-06-07T19:30:00Z",
    end_date: "2026-06-07T21:00:00Z",
    establishment: "Euskalduna",
    place: "Bilbao",
    language: "ES",
    municipality_id: 1,
    active: true,
  },
  {
    id: 6,
    nombre: "Teatro: La casa de Bernarda Alba",
    type: "Teatro",
    start_date: "2026-06-08T20:00:00Z",
    end_date: "2026-06-08T22:00:00Z",
    establishment: "Teatro Campos",
    place: "Bilbao",
    language: "ES",
    municipality_id: 1,
    active: true,
  },
];
