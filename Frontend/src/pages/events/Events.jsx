import { Card } from "@components/Cards";
import { useFavorites } from "@shared/context/FavoritesContext";

const mockEvents = [
  {
    id: 1,
    nombre_es: "Concierto de jazz en el Café Iruña",
    typeEs: "Concierto",
    images: [{ imageUrl: "https://picsum.photos/seed/jazz/600/400" }],
    startDate: "2026-06-21T20:30:00Z",
    endDate: "2026-06-21T23:00:00Z",
    establishmentEs: "Café Iruña",
    municipalityEs: "Bilbao",
  },
  {
    id: 2,
    nombre_es: "Feria de artesanía vasca",
    typeEs: "Feria",
    images: [{ imageUrl: "https://picsum.photos/seed/feria/600/400" }],
    startDate: "2026-07-05T10:00:00Z",
    endDate: "2026-07-07T21:00:00Z",
    establishmentEs: "Plaza Nueva",
    municipalityEs: "Bilbao",
  },
  {
    id: 3,
    nombre_es: "Teatro: La casa de Bernarda Alba",
    typeEs: "Teatro",
    images: [{ imageUrl: "https://picsum.photos/seed/teatro/600/400" }],
    startDate: "2026-06-28T19:00:00Z",
    endDate: "2026-06-28T21:30:00Z",
    establishmentEs: "Teatro Arriaga",
    municipalityEs: "Bilbao",
  },
];

export default function Events() {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  function handleToggleFavorite(data) {
    if (isFavorite(data.id, "event")) {
      removeFavorite(data.id, "event");
    } else {
      addFavorite({ ...data, _variant: "event" });
    }
  }

  return (
    <div className="p-8 flex flex-col gap-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Eventos</h1>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockEvents.map((event) => (
          <Card
            key={event.id}
            variant="event"
            data={event}
            isFavorite={isFavorite(event.id, "event")}
            onToggleFavorite={handleToggleFavorite}
            onAction={(d) => console.log(d.nombre_es)}
          />
        ))}
      </section>
    </div>
  );
}
