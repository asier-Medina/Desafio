import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@features/auth/context/AuthContext";
import { getComercio, updateComercio } from "@services/admin.api";
import { FaArrowLeft, FaMagnifyingGlass, FaStar, FaToggleOn, FaToggleOff } from "@ui/icons";
import "./AdminComerciosPage.css";

export default function AdminComerciosPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [comercios, setComercio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null); // id del comercio actualizándose

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    setLoading(true);
    getComercio()
      .then(data => setComercio(Array.isArray(data) ? data : data.comercios ?? []))
      .catch(() => setError("No se pudieron cargar los comercios."))
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  const filtered = useMemo(() => {
    if (!search.trim()) return comercios;
    const q = search.toLowerCase();
    return comercios.filter(c => (c.nombre ?? c.name ?? "").toLowerCase().includes(q));
  }, [search, comercios]);

  async function toggleField(comercio, field) {
    const id = comercio.id;
    setUpdating(id + field);
    try {
      const updated = await updateComercio(id, { [field]: !comercio[field] });
      setComercio(prev =>
        prev.map(c => (c.id === id ? { ...c, active: updated.active, is_sponsored: updated.is_sponsored } : c))
      );
    } catch {
      // el estado local no cambia si falla
    } finally {
      setUpdating(null);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="admin-page">
        <p className="admin-page__loading">Cargando…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <button className="admin-page__back" onClick={() => navigate("/profile")}>
          <FaArrowLeft /> Volver al perfil
        </button>
        <p className="admin-page__error">{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <button className="admin-page__back" onClick={() => navigate("/profile")}>
          <FaArrowLeft /> Volver al perfil
        </button>
        <h1 className="admin-page__title">Gestión de comercios</h1>
        <p className="admin-page__count">{comercios.length} comercio{comercios.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="admin-page__search-wrap">
        <FaMagnifyingGlass className="admin-page__search-icon" />
        <input
          className="admin-page__search"
          type="search"
          placeholder="Buscar por nombre…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="admin-page__empty">
          {search ? `Sin resultados para "${search}"` : "No hay comercios registrados."}
        </p>
      ) : (
        <ul className="admin-comercios__list">
          {filtered.map(c => {
            const nombre = c.nombre ?? c.name ?? "—";
            const isActive = c.active ?? true;
            const isSponsored = c.is_sponsored ?? false;
            const municipio = c.Municipality?.nombre ?? c.municipio ?? null;
            return (
              <li key={c.id} className={`admin-comercios__item${!isActive ? " admin-comercios__item--inactive" : ""}`}>
                <div className="admin-comercios__info">
                  <span className="admin-comercios__name">{nombre}</span>
                  {municipio && (
                    <span className="admin-comercios__muni">{municipio}</span>
                  )}
                  <div className="admin-comercios__badges">
                    <span className={`admin-comercios__badge ${isActive ? "admin-comercios__badge--active" : "admin-comercios__badge--inactive"}`}>
                      {isActive ? "Activo" : "Inactivo"}
                    </span>
                    {isSponsored && (
                      <span className="admin-comercios__badge admin-comercios__badge--sponsored">
                        <FaStar /> Patrocinado
                      </span>
                    )}
                  </div>
                </div>
                <div className="admin-comercios__actions">
                  <button
                    className={`admin-comercios__toggle ${isActive ? "admin-comercios__toggle--danger" : "admin-comercios__toggle--success"}`}
                    onClick={() => toggleField(c, "active")}
                    disabled={updating === c.id + "active"}
                    title={isActive ? "Desactivar comercio" : "Activar comercio"}
                  >
                    {isActive ? (
                      <><FaToggleOn /> Desactivar</>
                    ) : (
                      <><FaToggleOff /> Activar</>
                    )}
                  </button>
                  <button
                    className={`admin-comercios__toggle ${isSponsored ? "admin-comercios__toggle--sponsored-on" : "admin-comercios__toggle--sponsored-off"}`}
                    onClick={() => toggleField(c, "is_sponsored")}
                    disabled={updating === c.id + "is_sponsored"}
                    title={isSponsored ? "Quitar patrocinio" : "Marcar como patrocinado"}
                  >
                    <FaStar /> {isSponsored ? "Patrocinado" : "Patrocinar"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
