import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useFavorites } from "@shared/context/FavoritesContext";
import { useLanguage } from "@features/language/LanguageContext";
import Detail from "@components/Detail/Detail";

const mockCulture = [
  {
    id: 1,
    nombre: "Museo Guggenheim Bilbao",
    tipo_lugar: "museo",
    imagen_url: "https://picsum.photos/seed/guggenheim/800/600",
    valoracion: 4.7,
    numero_valoraciones: 1256,
    direccion: "Abandoibarra Etorbidea, 2, 48009 Bilbao",
    descripcion: "Museo de arte contemporáneo diseñado por Frank Gehry. Alberga colecciones permanentes y exposiciones temporales de primer nivel.",
  },
  {
    id: 2,
    nombre: "Teatro Victoria Eugenia",
    tipo_lugar: "teatro",
    imagen_url: "https://picsum.photos/seed/victoria/800/600",
    valoracion: 4.5,
    numero_valoraciones: 432,
    direccion: "Donostia, 20004",
    descripcion: "Teatro histórico de San Sebastián con una programación variada de ópera, teatro y danza.",
  },
  {
    id: 3,
    nombre: "Catedral de Santa María",
    tipo_lugar: "monumento",
    imagen_url: "https://picsum.photos/seed/catedral/800/600",
    valoracion: 4.6,
    numero_valoraciones: 789,
    direccion: "Calle de la Catedral, 1, 01001 Vitoria-Gasteiz",
    descripcion: "Imponente catedral gótica del siglo XIII en el Casco Medieval de Vitoria-Gasteiz.",
  },
];

export default function CultureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { translate } = useLanguage();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const rawData = mockCulture.find((c) => c.id === Number(id));
  const [data, setData] = useState(rawData);

  useEffect(() => {
    if (!rawData) return;
    translate(rawData, ["nombre", "direccion", "descripcion", "tipo_lugar"]).then(setData);
  }, [rawData, translate]);

  function handleToggleFavorite(item) {
    if (isFavorite(item.id, "culture")) {
      removeFavorite(item.id, "culture");
    } else {
      addFavorite({ ...item, _variant: "culture" });
    }
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <h1>Lugar no encontrado</h1>
        <button onClick={() => navigate("/culture")}>Volver a cultura</button>
      </div>
    );
  }

  return (
    <Detail
      variant="culture"
      data={data}
      onBack={() => navigate("/culture")}
      isFavorite={isFavorite(data.id, "culture")}
      onToggleFavorite={handleToggleFavorite}
    />
  );
}
