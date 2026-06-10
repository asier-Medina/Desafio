import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useFavorites } from "@shared/context/FavoritesContext";
import { useLanguage } from "@shared/context/LanguageContext";
import Detail from "@components/Detail/Detail";
import * as cultureApi from "@services/culture.api";

export default function CultureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, translate } = useLanguage();
  const { addFavorite, removeFavorite, isFavorite, user } = useFavorites();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cultureApi.getById(id)
      .then(item => translate(item, ["nombre", "direccion", "descripcion", "tipo_lugar"]).then(setData))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, translate]);

  function handleToggleFavorite(item) {
    if (isFavorite(item.id, "culture")) {
      removeFavorite(item.id, "culture");
    } else {
      addFavorite({ ...item, _variant: "culture" });
    }
  }

  if (loading) return <div className="p-8">{t.culturePage.loading}</div>;

  if (!data) return (
    <div className="p-8 text-center">
      <h1>{t.culturePage.notFound}</h1>
      <button onClick={() => navigate("/culture")}>{t.culturePage.backToList}</button>
    </div>
  );

  return (
    <Detail
      variant="culture"
      data={data}
      onBack={() => navigate("/culture")}
      isFavorite={isFavorite(data.id, "culture")}
      onToggleFavorite={user ? handleToggleFavorite : undefined}
    />
  );
}
