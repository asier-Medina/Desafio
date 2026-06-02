import { Card } from "@components/Cards";
import { useFavorites } from "@shared/context/FavoritesContext";

const mockPlaces = [
  {
    id: 1,
    nombre: "Museo Guggenheim Bilbao",
    tipo_lugar: "museo",
    imagen_url: "https://picsum.photos/seed/guggenheim/600/400",
    direccion: "Abandoibarra Etorbidea, 2",
    municipio: "Bilbao",
    valoracion: 4.8,
    num_valoraciones: 45230,
  },
  {
    id: 2,
    nombre: "Teatro Arriaga",
    tipo_lugar: "teatro",
    imagen_url: "https://picsum.photos/seed/arriaga/600/400",
    direccion: "Plaza del Arriaga, 1",
    municipio: "Bilbao",
    valoracion: 4.6,
    num_valoraciones: 12890,
  },
  {
    id: 3,
    nombre: "Catedral de Santiago",
    tipo_lugar: "monumento",
    imagen_url: "https://picsum.photos/seed/santiago/600/400",
    direccion: "Plaza de Santiago, 1",
    municipio: "Bilbao",
    valoracion: 4.5,
    num_valoraciones: 8750,
  },
];

export default function Culture() {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  function handleToggleFavorite(data) {
    if (isFavorite(data.id, "culture")) {
      removeFavorite(data.id, "culture");
    } else {
      addFavorite({ ...data, _variant: "culture" });
    }
  }

  return (
    <div className="p-8 flex flex-col gap-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Cultura</h1>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockPlaces.map((place) => (
          <Card
            key={place.id}
            variant="culture"
            data={place}
            isFavorite={isFavorite(place.id, "culture")}
            onToggleFavorite={handleToggleFavorite}
            onAction={(d) => console.log(d.nombre)}
          />
        ))}
      </section>
    </div>
  );
}
