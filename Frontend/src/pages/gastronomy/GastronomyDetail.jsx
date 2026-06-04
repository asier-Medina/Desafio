import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useFavorites } from "@shared/context/FavoritesContext";
import Detail from "@components/Detail/Detail";
import * as gastronomyApi from "@services/gastronomy.api";

export default function GastronomyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite, user } = useFavorites();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gastronomyApi.getById(id)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  function handleToggleFavorite(item) {
    if (isFavorite(item.id, "gastronomy")) {
      removeFavorite(item.id, "gastronomy");
    } else {
      addFavorite({ ...item, _variant: "gastronomy" });
    }
  }

  if (loading) return <div className="p-8">Cargando restaurante...</div>;

  if (!data) return (
    <div className="p-8 text-center">
      <h1>Restaurante no encontrado</h1>
      <button onClick={() => navigate("/gastronomy")}>Volver a gastronomía</button>
    </div>
  );

  return (
    <Detail
      variant="gastronomy"
      data={data}
      onBack={() => navigate("/gastronomy")}
      isFavorite={isFavorite(data.id, "gastronomy")}
      onToggleFavorite={user ? handleToggleFavorite : undefined}
    />
  );
}
