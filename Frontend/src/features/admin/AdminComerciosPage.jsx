import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@features/auth/context/AuthContext";
import {
  getComercio, updateComercio,
  getCultura, updateCultura,
  getEventos, updateEvento,
} from "@services/admin.api";
import { FaArrowLeft, FaMagnifyingGlass, FaStar, FaToggleOn, FaToggleOff } from "@ui/icons";
import "./AdminComerciosPage.css";

const TABS = [
  { id: "gastronomy", label: "Gastronomía" },
  { id: "culture",    label: "Cultura"     },
  { id: "events",     label: "Eventos"     },
];

const FETCHERS = {
  gastronomy: getComercio,
  culture:    getCultura,
  events:     getEventos,
};

const UPDATERS = {
  gastronomy: updateComercio,
  culture:    updateCultura,
  events:     updateEvento,
};

function getItemName(item, tab) {
  if (tab === "events") return item.nombre_es || item.nombre || item.establishment || item.type || "—";
  return item.nombre || "—";
}

function getItemCategory(item, tab) {
  if (tab === "gastronomy") return item.tipo_comida || item.type || null;
  if (tab === "culture")    return item.tipo_lugar || null;
  if (tab === "events")     return item.type || null;
  return null;
}

export default function AdminComerciosPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab]   = useState("gastronomy");
  const [data, setData]             = useState({ gastronomy: [], culture: [], events: [] });
  const [loadedTabs, setLoadedTabs] = useState(new Set());
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("");
  const [updating, setUpdating]     = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") { navigate("/"); return; }
    if (loadedTabs.has(activeTab)) return;

    setLoading(true);
    setError(null);
    FETCHERS[activeTab]()
      .then(res => {
        setData(prev => ({ ...prev, [activeTab]: Array.isArray(res) ? res : [] }));
        setLoadedTabs(prev => new Set([...prev, activeTab]));
      })
      .catch(() => setError("No se pudieron cargar los datos."))
      .finally(() => setLoading(false));
  }, [activeTab, user, authLoading]);

  const items = data[activeTab];

  const categories = useMemo(() => {
    const seen = new Set();
    items.forEach(item => {
      const cat = getItemCategory(item, activeTab);
      if (cat) seen.add(cat);
    });
    return Array.from(seen).sort();
  }, [items, activeTab]);

  const filtered = useMemo(() => {
    let result = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(item => getItemName(item, activeTab).toLowerCase().includes(q));
    }
    if (catFilter) {
      result = result.filter(item => getItemCategory(item, activeTab) === catFilter);
    }
    return result;
  }, [items, search, catFilter, activeTab]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setSearch("");
    setCatFilter("");
  }

  async function toggleField(item, field) {
    const id = item.id;
    setUpdating(id + field);
    try {
      const updated = await UPDATERS[activeTab](id, { [field]: !item[field] });
      setData(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(c =>
          c.id === id ? { ...c, active: updated.active, is_sponsored: updated.is_sponsored } : c
        ),
      }));
    } catch {
      // local state unchanged on error
    } finally {
      setUpdating(null);
    }
  }

  if (authLoading || (loading && !loadedTabs.has(activeTab))) {
    return <div className="admin-page"><p className="admin-page__loading">Cargando…</p></div>;
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
        <h1 className="admin-page__title">Gestión de contenido</h1>
        <p className="admin-page__count">{items.length} elemento{items.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="admin-comercios__tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`admin-comercios__tab${activeTab === tab.id ? " admin-comercios__tab--active" : ""}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-page__filters">
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
        {categories.length > 0 && (
          <select
            className="admin-comercios__category-select"
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="admin-page__empty">
          {search || catFilter ? `Sin resultados para los filtros aplicados.` : "No hay elementos registrados."}
        </p>
      ) : (
        <ul className="admin-comercios__list">
          {filtered.map(item => {
            const nombre     = getItemName(item, activeTab);
            const isActive   = item.active ?? true;
            const isSponsored = item.is_sponsored ?? false;
            const municipio  = item.Municipality?.nombre ?? item.municipio ?? null;
            const cat        = getItemCategory(item, activeTab);
            return (
              <li key={item.id} className={`admin-comercios__item${!isActive ? " admin-comercios__item--inactive" : ""}`}>
                <div className="admin-comercios__info">
                  <span className="admin-comercios__name">{nombre}</span>
                  {municipio && <span className="admin-comercios__muni">{municipio}</span>}
                  <div className="admin-comercios__badges">
                    <span className={`admin-comercios__badge ${isActive ? "admin-comercios__badge--active" : "admin-comercios__badge--inactive"}`}>
                      {isActive ? "Activo" : "Inactivo"}
                    </span>
                    {cat && (
                      <span className="admin-comercios__badge admin-comercios__badge--type">{cat}</span>
                    )}
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
                    onClick={() => toggleField(item, "active")}
                    disabled={updating === item.id + "active"}
                    title={isActive ? "Desactivar" : "Activar"}
                  >
                    {isActive ? <><FaToggleOn /> Desactivar</> : <><FaToggleOff /> Activar</>}
                  </button>
                  <button
                    className={`admin-comercios__toggle ${isSponsored ? "admin-comercios__toggle--sponsored-on" : "admin-comercios__toggle--sponsored-off"}`}
                    onClick={() => toggleField(item, "is_sponsored")}
                    disabled={updating === item.id + "is_sponsored"}
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
