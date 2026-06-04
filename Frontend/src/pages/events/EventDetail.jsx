import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useFavorites } from "@shared/context/FavoritesContext";
import { useLanguage } from "@features/language/LanguageContext";
import Detail from "@components/Detail/Detail";
import * as eventsApi from "@services/events.api";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { translate } = useLanguage();
  const { addFavorite, removeFavorite, isFavorite, user } = useFavorites();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.getById(id)
      .then(item => translate(item, ["nombre_es", "type", "establishment", "place", "descripcion"]).then(setData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, translate]);

  function handleToggleFavorite(item) {
    if (isFavorite(item.id, "event")) {
      removeFavorite(item.id, "event");
    } else {
      addFavorite({ ...item, _variant: "event" });
    }
  }

  if (loading) return <div className="p-8">Cargando evento...</div>;

  if (!data) return (
    <div className="p-8 text-center">
      <h1>Evento no encontrado</h1>
      <button onClick={() => navigate("/events")}>Volver a eventos</button>
    </div>
  );

  return (
    <Detail
      variant="event"
      data={data}
      onBack={() => navigate("/events")}
      isFavorite={isFavorite(data.id, "event")}
      onToggleFavorite={user ? handleToggleFavorite : undefined}
    />
  );
}
