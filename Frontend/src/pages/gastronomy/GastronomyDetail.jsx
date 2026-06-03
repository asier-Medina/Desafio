import { useParams, useNavigate } from "react-router";
import { useFavorites } from "@shared/context/FavoritesContext";
import Detail from "@components/Detail/Detail";

const mockGastronomy = [
  {
    id: 1,
    nombre: "Restaurante Arzak",
    tipo_comida: "restaurante",
    url_imagen: "https://picsum.photos/seed/arzak/800/600",
    valoracion: 4.8,
    num_resenas: 342,
    direccion: "Calle del Medio, 3, 20003 Donostia",
    michelin: true,
    repsol: true,
    descripcion: "Uno de los restaurantes más emblemáticos de la cocina vasca, con estrella Michelin y tres soles Repsol.",
  },
  {
    id: 2,
    nombre: "Sidrería Petritegi",
    tipo_comida: "sidreria",
    url_imagen: "https://picsum.photos/seed/petritegi/800/600",
    valoracion: 4.5,
    num_resenas: 198,
    direccion: "Barrio de Astigarraga, 20115",
    michelin: false,
    repsol: false,
    descripcion: "Sidrería tradicional con txuletón y sidra natural. Experiencia gastronómica vasca por excelencia.",
  },
  {
    id: 3,
    nombre: "Café Bar Bilbao",
    tipo_comida: "bar",
    url_imagen: "https://picsum.photos/seed/bilbao/800/600",
    valoracion: 4.1,
    num_resenas: 87,
    direccion: "Calle de la Merced, 5, 48003 Bilbao",
    michelin: false,
    repsol: false,
    descripcion: "Bar de pintxos con amplia variedad de vinos y productos locales.",
  },
];

export default function GastronomyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const data = mockGastronomy.find((g) => g.id === Number(id));

  function handleToggleFavorite(item) {
    if (isFavorite(item.id, "gastronomy")) {
      removeFavorite(item.id, "gastronomy");
    } else {
      addFavorite({ ...item, _variant: "gastronomy" });
    }
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <h1>Restaurante no encontrado</h1>
        <button onClick={() => navigate("/gastronomy")}>Volver a gastronomía</button>
      </div>
    );
  }

  return (
    <Detail
      variant="gastronomy"
      data={data}
      onBack={() => navigate("/gastronomy")}
      isFavorite={isFavorite(data.id, "gastronomy")}
      onToggleFavorite={handleToggleFavorite}
    />
  );
}
