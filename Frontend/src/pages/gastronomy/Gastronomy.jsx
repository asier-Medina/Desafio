import { useNavigate } from "react-router";
import { Card } from "@components/Cards";
import { useFavorites } from "@shared/context/FavoritesContext";

const mockRestaurants = [
  {
    id: 1,
    nombre: "Restaurante Mina",
    tipo_comida: "asador",
    url_imagen: "https://picsum.photos/seed/mina/600/400",
    direccion: "Calle de la Merced, 1, 48003 Bilbao",
    valoracion: 4.7,
    num_resenas: 312,
    michelin: true,
    repsol: true,
  },
  {
    id: 2,
    nombre: "Sidrería Petritegi",
    tipo_comida: "sidreria",
    url_imagen: "https://picsum.photos/seed/petritegi/600/400",
    direccion: "Barrio de Astigarraga, 20115",
    valoracion: 4.5,
    num_resenas: 890,
    michelin: false,
    repsol: true,
  },
  {
    id: 3,
    nombre: "Bar Gure Toki",
    tipo_comida: "bar",
    url_imagen: "https://picsum.photos/seed/gure/600/400",
    direccion: "Calle del Perro, 3, 48001 Bilbao",
    valoracion: 4.3,
    num_resenas: 215,
    michelin: false,
    repsol: false,
  },
];

export default function Gastronomy() {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  function handleToggleFavorite(data) {
    if (isFavorite(data.id, "gastronomy")) {
      removeFavorite(data.id, "gastronomy");
    } else {
      addFavorite({ ...data, _variant: "gastronomy" });
    }
  }

  return (
    <div className="p-8 flex flex-col gap-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Gastronomía</h1>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockRestaurants.map((rest) => (
          <Card
            key={rest.id}
            variant="gastronomy"
            data={rest}
            isFavorite={isFavorite(rest.id, "gastronomy")}
            onToggleFavorite={handleToggleFavorite}
            onAction={(d) => navigate(`/gastronomy/${d.id}`)}
          />
        ))}
      </section>
    </div>
  );
}
