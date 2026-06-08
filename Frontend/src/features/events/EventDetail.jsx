import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useFavorites } from "@shared/context/FavoritesContext";
import { useLanguage } from "@shared/context/LanguageContext";
import Detail from "@components/Detail/Detail";
import * as eventsApi from "@services/events.api";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, translate } = useLanguage();
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

  if (loading) return <div className="p-8">{t.eventsPage.loading}</div>;

  if (!data) return (
    <div className="p-8 text-center">
      <h1>{t.eventsPage.notFound}</h1>
      <button onClick={() => navigate("/events")}>{t.eventsPage.backToList}</button>
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
