import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@features/auth/context/AuthContext";
import { useFavorites } from "@shared/context/FavoritesContext";
import Button from "@ui/Button";
import { Card } from "@components/Cards";
import InputField from "@features/auth/components/InputField";
import SelectField from "@features/auth/components/SelectField";
import { FaArrowRightFromBracket, FaRegHeart, FaPen, FaCheck } from "../../shared/ui/icons";
import { getNameById, getAll as getMunicipalities } from "@services/municipalities";
import "./Profile.css";

const fallbackUser = {
  name: "Invitado",
  lastName: "",
  email: "invitado@sustrai.eus",
  createdAt: new Date().toISOString(),
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const profile = user || fallbackUser;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile.name || "",
    lastName: profile.lastName || "",
    tlf: profile.tlf || "",
    municipality_id: profile.municipality_id || "",
    sexo: profile.sexo || "",
    age: profile.age || "",
  });

  const municipalities = getMunicipalities();

  const fullName = [profile.name, profile.lastName].filter(Boolean).join(" ") || "Invitado";

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  function toggleEdit() {
    if (editing) {
      setForm({
        name: profile.name || "",
        lastName: profile.lastName || "",
        tlf: profile.tlf || "",
        municipality_id: profile.municipality_id || "",
        sexo: profile.sexo || "",
        age: profile.age || "",
      });
    }
    setEditing((prev) => !prev);
  }

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  return (
    <div className="profile">
      <div className="profile__header">
        <div className="profile__header-top">
          <h1 className="profile__name">{fullName}</h1>
          <div className="profile__header-actions">
            {user && (
              <Button variant="ghost" size="sm" onClick={toggleEdit}>
                {editing ? <><FaCheck /> Hecho</> : <><FaPen /> Editar</>}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <FaArrowRightFromBracket /> Salir
            </Button>
          </div>
        </div>
      </div>

      <div className="profile__card">
        <h2 className="profile__card-title">Información personal</h2>

        {editing ? (
          <div className="profile__form">
            <InputField label="Nombre" id="edit-name" type="text" value={form.name} onChange={handleChange("name")} maxLength={100} />
            <InputField label="Apellido" id="edit-lastname" type="text" value={form.lastName} onChange={handleChange("lastName")} maxLength={100} />
            <InputField label="Teléfono" id="edit-tlf" type="tel" value={form.tlf} onChange={handleChange("tlf")} maxLength={20} />
            <SelectField label="Municipio" id="edit-municipality" options={municipalities} value={form.municipality_id} onChange={handleChange("municipality_id")} />
            <SelectField label="Sexo" id="edit-sexo" options={[
              { value: "hombre", label: "Hombre" },
              { value: "mujer", label: "Mujer" },
              { value: "otro", label: "Otro" },
            ]} value={form.sexo} onChange={handleChange("sexo")} />
            <InputField label="Edad" id="edit-age" type="number" value={form.age} onChange={handleChange("age")} min={1} max={119} />
          </div>
        ) : (
          <dl className="profile__info-list">
            <div className="profile__info-row">
              <dt>Email</dt>
              <dd>{profile.email}</dd>
            </div>
            {profile.tlf && (
              <div className="profile__info-row">
                <dt>Teléfono</dt>
                <dd>{profile.tlf}</dd>
              </div>
            )}
            {profile.municipality_id && (
              <div className="profile__info-row">
                <dt>Municipio</dt>
                <dd>{getNameById(profile.municipality_id)}</dd>
              </div>
            )}
            {profile.sexo && (
              <div className="profile__info-row">
                <dt>Sexo</dt>
                <dd>{profile.sexo}</dd>
              </div>
            )}
            {profile.age && (
              <div className="profile__info-row">
                <dt>Edad</dt>
                <dd>{profile.age} años</dd>
              </div>
            )}
            {profile.createdAt && (
              <div className="profile__info-row">
                <dt>Miembro desde</dt>
                <dd>{new Date(profile.createdAt).toLocaleDateString("es", { year: "numeric", month: "long" })}</dd>
              </div>
            )}
          </dl>
        )}
      </div>

      <section className="profile__section">
        <h2 className="profile__section-title">
          <FaRegHeart className="profile__section-icon" />
          Favoritos
        </h2>
        {favorites.length === 0 ? (
          <p className="profile__empty">No tienes favoritos aún.</p>
        ) : (
          <div className="profile__favorites">
            {favorites.map((item) => (
              <Card
                key={`${item._variant}-${item.id}`}
                variant={item._variant}
                data={item}
                isFavorite={true}
                onToggleFavorite={() => removeFavorite(item.id, item._variant)}
                onAction={() => navigate(`/${item._variant === "event" ? "events" : item._variant === "gastronomy" ? "gastronomy" : "culture"}/${item.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
