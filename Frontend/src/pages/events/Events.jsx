import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "@components/Cards";
import { useFavorites } from "@shared/context/FavoritesContext";
import * as eventsApi from "@services/events.api";

export default function Events() {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite, user } = useFavorites();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.list()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleToggleFavorite(data) {
    if (isFavorite(data.id, "event")) {
      removeFavorite(data.id, "event");
    } else {
      addFavorite({ ...data, _variant: "event" });
    }
  }

  if (loading) return <div className="p-8">Cargando eventos...</div>;

  return (
    <div className="p-8 flex flex-col gap-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Eventos</h1>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card
            key={event.id}
            variant="event"
            data={event}
            isFavorite={isFavorite(event.id, "event")}
            onToggleFavorite={user ? handleToggleFavorite : undefined}
            onAction={(d) => navigate(`/events/${d.id}`)}
          />
        ))}
      </section>
    </div>
  );
}
