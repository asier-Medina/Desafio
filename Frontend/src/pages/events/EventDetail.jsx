import { useParams, useNavigate } from "react-router";
import { useFavorites } from "@shared/context/FavoritesContext";
import Detail from "@components/Detail/Detail";

const mockEvents = [
  {
    id: 1,
    nombre_es: "Concierto de jazz en el Café Iruña",
    type: "Concierto",
    images: [{ imageUrl: "https://picsum.photos/seed/jazz/800/600" }],
    start_date: "2026-06-21T20:30:00Z",
    end_date: "2026-06-21T23:00:00Z",
    establishment: "Café Iruña",
    place: "Bilbao",
    is_free: false,
    price_eur: 15,
    purchase_url: "https://example.com/entradas",
    descripcion: "Disfruta de una noche de jazz en el emblemático Café Iruña de Bilbao. Actuación en directo con los mejores músicos locales.",
  },
  {
    id: 2,
    nombre_es: "Feria de artesanía vasca",
    type: "Feria",
    images: [{ imageUrl: "https://picsum.photos/seed/feria/800/600" }],
    start_date: "2026-07-05T10:00:00Z",
    end_date: "2026-07-07T21:00:00Z",
    establishment: "Plaza Nueva",
    place: "Bilbao",
    is_free: true,
    descripcion: "Ven a descubrir la mejor artesanía vasca en la Plaza Nueva. Más de 50 puestos con productos locales.",
  },
  {
    id: 3,
    nombre_es: "Teatro: La casa de Bernarda Alba",
    type: "Teatro",
    images: [{ imageUrl: "https://picsum.photos/seed/teatro/800/600" }],
    start_date: "2026-06-28T19:00:00Z",
    end_date: "2026-06-28T21:30:00Z",
    establishment: "Teatro Arriaga",
    place: "Bilbao",
    is_free: false,
    price_eur: 22,
    purchase_url: "https://example.com/entradas",
    descripcion: "Obra clásica de Federico García Lorca interpretada por la compañía bilbaína de teatro.",
  },
];

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const data = mockEvents.find((e) => e.id === Number(id));

  function handleToggleFavorite(item) {
    if (isFavorite(item.id, "event")) {
      removeFavorite(item.id, "event");
    } else {
      addFavorite({ ...item, _variant: "event" });
    }
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <h1>Evento no encontrado</h1>
        <button onClick={() => navigate("/events")}>Volver a eventos</button>
      </div>
    );
  }

  return (
    <Detail
      variant="event"
      data={data}
      onBack={() => navigate("/events")}
      isFavorite={isFavorite(data.id, "event")}
      onToggleFavorite={handleToggleFavorite}
    />
  );
}
