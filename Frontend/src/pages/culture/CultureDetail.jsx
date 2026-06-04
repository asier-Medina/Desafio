import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useFavorites } from "@shared/context/FavoritesContext";
import Detail from "@components/Detail/Detail";
import * as cultureApi from "@services/culture.api";

export default function CultureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite, user } = useFavorites();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cultureApi.getById(id)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  function handleToggleFavorite(item) {
    if (isFavorite(item.id, "culture")) {
      removeFavorite(item.id, "culture");
    } else {
      addFavorite({ ...item, _variant: "culture" });
    }
  }

  if (loading) return <div className="p-8">Cargando lugar...</div>;

  if (!data) return (
    <div className="p-8 text-center">
      <h1>Lugar no encontrado</h1>
      <button onClick={() => navigate("/culture")}>Volver a cultura</button>
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
