import { Card } from "@components/Cards";

const mockEvent = {
  id: 1,
  nombre_es: "Concierto de jazz en el Café Iruña",
  typeEs: "Concierto",
  images: [{ imageUrl: "https://picsum.photos/seed/jazz/600/400" }],
  startDate: "2026-06-21T20:30:00Z",
  endDate: "2026-06-21T23:00:00Z",
  establishmentEs: "Café Iruña",
  municipalityEs: "Bilbao",
};

const mockRestaurant = {
  id: 1,
  nombre: "Restaurante Mina",
  tipo_comida: "asador",
  url_imagen: "https://picsum.photos/seed/mina/600/400",
  municipio: "Bilbao",
  valoracion: 4.7,
  num_resenas: 312,
  michelin: true,
  repsol: true,
};

const mockPlace = {
  id: 1,
  nombre: "Museo Guggenheim Bilbao",
  tipo_lugar: "museo",
  imagen_url: "https://picsum.photos/seed/guggenheim/600/400",
  direccion: "Abandoibarra Etorbidea, 2",
  municipio: "Bilbao",
  valoracion: 4.8,
  num_valoraciones: 45230,
};

export default function Events() {
  return (
    <div className="p-8 flex flex-col gap-6 max-w-4xl">
      <h1 className="text-2xl font-semibold">Vista previa de Cards</h1>

      <section>
        <h2 className="text-lg font-medium mb-3">Card variant=&quot;event&quot;</h2>
        <Card variant="event" data={mockEvent} onAction={(d) => console.log(d.nombre_es)} />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Card variant=&quot;gastronomy&quot;</h2>
        <Card variant="gastronomy" data={mockRestaurant} onAction={(d) => console.log(d.nombre)} />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Card variant=&quot;culture&quot;</h2>
        <Card variant="culture" data={mockPlace} onAction={(d) => console.log(d.nombre)} />
      </section>
    </div>
  );
}
