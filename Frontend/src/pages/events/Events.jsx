import { useNavigate } from "react-router";
import { Card } from "@components/Cards";
import { useFavorites } from "@shared/context/FavoritesContext";

const mockEvents = [
  {
    id: 1,
    nombre: "Concierto de jazz en el Café Iruña",
    type: "Concierto",
    images: [{ imageUrl: "https://picsum.photos/seed/jazz/600/400" }],
    start_date: "2026-06-21T20:30:00Z",
    end_date: "2026-06-21T23:00:00Z",
    establishment: "Café Iruña",
    place: "Bilbao",
  },
  {
    id: 2,
    nombre: "Feria de artesanía vasca",
    type: "Feria",
    images: [{ imageUrl: "https://picsum.photos/seed/feria/600/400" }],
    start_date: "2026-07-05T10:00:00Z",
    end_date: "2026-07-07T21:00:00Z",
    establishment: "Plaza Nueva",
    place: "Bilbao",
  },
  {
    id: 3,
    nombre: "Teatro: La casa de Bernarda Alba",
    type: "Teatro",
    images: [{ imageUrl: "https://picsum.photos/seed/teatro/600/400" }],
    start_date: "2026-06-28T19:00:00Z",
    end_date: "2026-06-28T21:30:00Z",
    establishment: "Teatro Arriaga",
    place: "Bilbao",
  },
];

export default function Events() {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  function handleToggleFavorite(data) {
    if (isFavorite(data.id, "event")) {
      removeFavorite(data.id, "event");
    } else {
      addFavorite({ ...data, _variant: "event" });
    }
  }

  return (
    <div className="p-8 flex flex-col gap-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Eventos</h1>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockEvents.map((event) => (
          <Card
            key={event.id}
            variant="event"
            data={event}
            isFavorite={isFavorite(event.id, "event")}
            onToggleFavorite={handleToggleFavorite}
            onAction={(d) => navigate(`/events/${d.id}`)}
          />
        ))}
      </section>
    </div>
  );
}
