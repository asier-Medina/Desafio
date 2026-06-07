import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@features/auth/context/AuthContext";
import { useFavorites } from "@shared/context/FavoritesContext";
import Button from "@ui/Button";
import { Card } from "@components/Cards";
import InputField from "@features/auth/components/InputField";
import SelectField from "@features/auth/components/SelectField";
import MunicipalityAutocomplete from "@features/auth/components/MunicipalityAutocomplete";
import { FaArrowRightFromBracket, FaRegHeart, FaPen, FaCheck, FaXmark, FaUsers, FaStore, FaArrowRight } from "@ui/icons";
import { getNameById, getAll as getMunicipalities } from "@services/municipalities";
import {
  getInterestsCatalog, getMyInterests, getMyPreferences,
  updateMe, updateInterests, updatePreferences,
} from "@services/user.service";
import "./Profile.css";

// ── helpers ────────────────────────────────────────────────────
function buildTree(items) {
  const map = {};
  items.forEach(i => { map[i.id_interes] = { ...i, children: [] }; });
  const roots = [];
  items.forEach(i => {
    if (i.father_id != null && map[i.father_id]) map[i.father_id].children.push(map[i.id_interes]);
    else if (i.father_id == null) roots.push(map[i.id_interes]);
  });
  return roots;
}

function groupSelected(tree, selectedIds) {
  const set = new Set(selectedIds);
  const groups = [];
  function collectLeaves(node, acc) {
    if (node.children.length === 0) { if (set.has(node.id_interes)) acc.push(node.nombre); }
    else node.children.forEach(c => collectLeaves(c, acc));
  }
  for (const root of tree) {
    const items = [];
    root.children.forEach(c => collectLeaves(c, items));
    if (items.length) groups.push({ label: root.nombre, items });
  }
  return groups;
}

const PRECIO_OPTS = [
  { value: "bajo",  label: "Económico" },
  { value: "medio", label: "Estándar"  },
  { value: "alto",  label: "Premium"   },
];

const SEXO_OPTS = [
  { value: "hombre", label: "Hombre" },
  { value: "mujer",  label: "Mujer"  },
  { value: "otro",   label: "Otro"   },
];

// ── sub-components ─────────────────────────────────────────────
function InterestChip({ label, selected, onToggle, readOnly }) {
  if (readOnly) return <span className="profile__chip">{label}</span>;
  return (
    <button
      type="button"
      className={`profile__chip-btn${selected ? " profile__chip-btn--on" : ""}`}
      onClick={onToggle}
    >{label}</button>
  );
}

function InterestNode({ node, selectedIds, onToggle, readOnly }) {
  if (node.children.length === 0) {
    return (
      <InterestChip
        label={node.nombre}
        selected={selectedIds.includes(node.id_interes)}
        onToggle={() => onToggle(node.id_interes)}
        readOnly={readOnly}
      />
    );
  }
  return (
    <div className="profile__interest-sub">
      <p className="profile__interest-sub-label">{node.nombre}</p>
      <div className="profile__chips-row">
        {node.children.map(c => (
          <InterestNode key={c.id_interes} node={c} selectedIds={selectedIds} onToggle={onToggle} readOnly={readOnly} />
        ))}
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────
const fallbackUser = {
  name: "Invitado",
  email: "invitado@sustrai.eus",
  createdAt: new Date().toISOString(),
};

export default function Profile() {
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const profile   = user || fallbackUser;
  const allMunis  = getMunicipalities();

  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [loading, setLoading]   = useState(true);

  // personal info form
  const [form, setForm] = useState({
    name:            profile.name            || "",
    municipality_id: profile.municipality_id || null,
    sexo:            profile.sexo            || "",
    age:             profile.age             || "",
  });

  // interests
  const [catalog,     setCatalog]     = useState([]);   // full tree
  const [selectedIds, setSelectedIds] = useState([]);   // what the user has selected
  const [editIds,     setEditIds]     = useState([]);   // working copy while editing

  // preferences
  const [prefs, setPrefs] = useState({ rango_precio: "", movilidad_reducida: false, municipios_interes: [] });
  const [editPrefs, setEditPrefs] = useState({ rango_precio: "", movilidad_reducida: false, municipios_interes: [] });

  const userId = user?.id;

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      getInterestsCatalog(),
      getMyInterests(),
      getMyPreferences().catch(() => null),
    ]).then(([rawCatalog, myInterests, myPrefs]) => {
      setCatalog(buildTree(rawCatalog));
      const ids = myInterests.map(i => i.id_interes);
      setSelectedIds(ids);
      setEditIds(ids);
      const p = {
        rango_precio:       myPrefs?.rango_precio        || "",
        movilidad_reducida: myPrefs?.movilidad_reducida  || false,
        municipios_interes: myPrefs?.municipios_interes  || [],
      };
      setPrefs(p);
      setEditPrefs(p);
    }).catch(() => {
      // los datos no cargaron — dejamos estados vacíos
    }).finally(() => setLoading(false));
  }, [userId]);

  // ── edit handlers ───────────────────────────────────────────
  function startEdit() {
    setForm({
      name:            profile.name            || "",
      municipality_id: profile.municipality_id || null,
      sexo:            profile.sexo            || "",
      age:             profile.age             || "",
    });
    setEditIds([...selectedIds]);
    setEditPrefs({ ...prefs });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  const handleFormChange = useCallback((field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  function toggleInterest(id) {
    setEditIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleMuni(id) {
    setEditPrefs(prev => ({
      ...prev,
      municipios_interes: prev.municipios_interes.includes(id)
        ? prev.municipios_interes.filter(x => x !== id)
        : [...prev.municipios_interes, id],
    }));
  }

  async function handleSave() {
    setSaving(true);
    // Cada guardado es independiente: un fallo en datos personales
    // no impide guardar intereses ni preferencias.
    const body = {};
    if (form.name)            body.nombre          = form.name;
    if (form.municipality_id) body.municipality_id = form.municipality_id;
    if (form.sexo)            body.sexo            = form.sexo;
    if (form.age)             body.age             = Number(form.age);

    const [, interestsOk, prefsOk] = await Promise.allSettled([
      Object.keys(body).length > 0 ? updateMe(body) : Promise.resolve(),
      updateInterests(editIds),
      updatePreferences({
        rango_precio:       editPrefs.rango_precio || undefined,
        movilidad_reducida: editPrefs.movilidad_reducida,
        municipios_interes: editPrefs.municipios_interes,
      }),
    ]);

    if (interestsOk.status === 'fulfilled') setSelectedIds(editIds);
    if (prefsOk.status === 'fulfilled')     setPrefs({ ...editPrefs });
    setSaving(false);
    setEditing(false);
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  // ── view helpers ────────────────────────────────────────────
  const interestGroups = groupSelected(catalog, selectedIds);
  const hasInterests   = interestGroups.some(g => g.items.length > 0);
  const hasPrefs       = prefs.rango_precio || prefs.movilidad_reducida || prefs.municipios_interes.length > 0;

  const selectedMuniNames = prefs.municipios_interes
    .map(id => getNameById(id))
    .filter(Boolean);

  return (
    <div className="profile">

      {/* ── Header ── */}
      <div className="profile__header">
        <div className="profile__header-top">
          <h1 className="profile__name">{profile.name || "Invitado"}</h1>
          <div className="profile__header-actions">
            {user && !editing && (
              <Button variant="ghost" size="sm" onClick={startEdit}>
                <FaPen /> Editar
              </Button>
            )}
            {user && editing && (
              <>
                <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={saving}>
                  <FaXmark /> Cancelar
                </Button>
                <Button variant="soft" size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando…" : <><FaCheck /> Guardar</>}
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <FaArrowRightFromBracket /> Salir
            </Button>
          </div>
        </div>
      </div>

      {/* ── Información personal ── */}
      <div className="profile__card">
        <h2 className="profile__card-title">Información personal</h2>

        {editing ? (
          <div className="profile__form">
            <InputField
              label="Nombre" id="edit-name" type="text"
              value={form.name} onChange={handleFormChange("name")} maxLength={100}
            />
            <MunicipalityAutocomplete
              id="edit-municipality"
              value={form.municipality_id}
              onChange={v => setForm(prev => ({ ...prev, municipality_id: v }))}
            />
            <SelectField
              label="Sexo" id="edit-sexo" options={SEXO_OPTS}
              value={form.sexo} onChange={handleFormChange("sexo")}
            />
            <InputField
              label="Edad" id="edit-age" type="number"
              value={form.age} onChange={handleFormChange("age")} min={1} max={119}
            />
          </div>
        ) : (
          <dl className="profile__info-list">
            <div className="profile__info-row"><dt>Email</dt><dd>{profile.email}</dd></div>
            {profile.municipality_id && (
              <div className="profile__info-row">
                <dt>Municipio</dt>
                <dd>{getNameById(user.municipality_id)}</dd>
              </div>
            )}
            {user.sexo && (
              <div className="profile__info-row">
                <dt>Sexo</dt>
                <dd>{SEXO_OPTS.find(o => o.value === profile.sexo)?.label ?? profile.sexo}</dd>
              </div>
            )}
            {profile.age && (
              <div className="profile__info-row"><dt>Edad</dt><dd>{profile.age} años</dd></div>
            )}
            {user.createdAt && (
              <div className="profile__info-row">
                <dt>Miembro desde</dt>
                <dd>{new Date(user.createdAt).toLocaleDateString("es", { year: "numeric", month: "long" })}</dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {/* ── Intereses ── */}
      {user && (
        <div className="profile__card">
          <h2 className="profile__card-title">Intereses</h2>

          {editing ? (
            loading ? (
              <p className="profile__no-data">Cargando…</p>
            ) : catalog.length === 0 ? (
              <p className="profile__no-data">No se pudo cargar el catálogo de intereses.</p>
            ) : (
              <div className="profile__interest-tree">
                {catalog.map(root => (
                  <div key={root.id_interes} className="profile__interest-cat">
                    <h3 className="profile__interest-cat-title">{root.nombre}</h3>
                    <div className="profile__chips-row">
                      {root.children.map(child => (
                        <InterestNode
                          key={child.id_interes}
                          node={child}
                          selectedIds={editIds}
                          onToggle={toggleInterest}
                          readOnly={false}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : loading ? (
            <p className="profile__no-data">Cargando…</p>
          ) : hasInterests ? (
            <div className="profile__interest-tree">
              {interestGroups.map(g => g.items.length > 0 && (
                <div key={g.label} className="profile__interest-cat">
                  <h3 className="profile__interest-cat-title">{g.label}</h3>
                  <div className="profile__chips-row">
                    {g.items.map(name => <span key={name} className="profile__chip">{name}</span>)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="profile__no-data">
              Aún no has añadido intereses.{" "}
              <button className="profile__no-data-link" onClick={startEdit}>Añadir ahora</button>
            </p>
          )}
        </div>
      )}

      {/* ── Preferencias ── */}
      {user && (
        <div className="profile__card">
          <h2 className="profile__card-title">Preferencias</h2>

          {editing ? (
            <div className="profile__form">
              <div className="profile__pref-block">
                <p className="profile__pref-label">Rango de precio</p>
                <div className="profile__btn-group">
                  {PRECIO_OPTS.map(opt => (
                    <button
                      key={opt.value} type="button"
                      className={`profile__btn-option${editPrefs.rango_precio === opt.value ? " profile__btn-option--on" : ""}`}
                      onClick={() => setEditPrefs(prev => ({ ...prev, rango_precio: prev.rango_precio === opt.value ? "" : opt.value }))}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>

              <div className="profile__pref-block">
                <label className="profile__check-row">
                  <input
                    type="checkbox"
                    checked={editPrefs.movilidad_reducida}
                    onChange={e => setEditPrefs(prev => ({ ...prev, movilidad_reducida: e.target.checked }))}
                  />
                  <span>Necesito accesibilidad para movilidad reducida</span>
                </label>
              </div>

              <div className="profile__pref-block">
                <p className="profile__pref-label">Municipios de interés</p>
                <div className="profile__chips-row profile__chips-row--wrap">
                  {allMunis.map(m => (
                    <button
                      key={m.value} type="button"
                      className={`profile__chip-btn${editPrefs.municipios_interes.includes(m.value) ? " profile__chip-btn--on" : ""}`}
                      onClick={() => toggleMuni(m.value)}
                    >{m.label}</button>
                  ))}
                </div>
              </div>
            </div>
          ) : loading ? (
            <p className="profile__no-data">Cargando…</p>
          ) : hasPrefs ? (
            <dl className="profile__info-list">
              {prefs.rango_precio && (
                <div className="profile__info-row">
                  <dt>Precio</dt>
                  <dd>{PRECIO_OPTS.find(o => o.value === prefs.rango_precio)?.label}</dd>
                </div>
              )}
              {prefs.movilidad_reducida && (
                <div className="profile__info-row">
                  <dt>Accesibilidad</dt>
                  <dd>Movilidad reducida</dd>
                </div>
              )}
              {selectedMuniNames.length > 0 && (
                <div className="profile__info-row">
                  <dt>Municipios</dt>
                  <dd>{selectedMuniNames.join(", ")}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="profile__no-data">
              Aún no has configurado tus preferencias.{" "}
              <button className="profile__no-data-link" onClick={startEdit}>Añadir ahora</button>
            </p>
          )}
        </div>
      )}

      {/* ── Favoritos ── */}
      <section className="profile__section">
        <h2 className="profile__section-title">
          <FaRegHeart className="profile__section-icon" />
          Favoritos
        </h2>
        {favorites.length === 0 ? (
          <p className="profile__empty">No tienes favoritos aún.</p>
        ) : (
          <div className="profile__favorites">
            {favorites.map(item => (
              <Card
                key={`${item._variant}-${item.id}`}
                variant={item._variant}
                data={item}
                isFavorite={true}
                onToggleFavorite={() => removeFavorite(item.id, item._variant)}
                onAction={() => {
                  const base = item._variant === "event" ? "events" : item._variant === "gastronomy" ? "gastronomy" : "culture";
                  navigate(`/${base}/${item.id}`);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Panel de administración (solo admin) ── */}
      {user?.role === "admin" && (
        <section className="profile__admin">
          <h2 className="profile__admin-title">Panel de administración</h2>
          <div className="profile__admin-banners">
            <button
              className="profile__admin-banner"
              onClick={() => navigate("/admin/usuarios")}
            >
              <FaUsers className="profile__admin-banner-icon" />
              <div className="profile__admin-banner-text">
                <p className="profile__admin-banner-label">Gestionar usuarios</p>
                <p className="profile__admin-banner-desc">Ver todos los usuarios registrados</p>
              </div>
              <FaArrowRight className="profile__admin-banner-arrow" />
            </button>
            <button
              className="profile__admin-banner"
              onClick={() => navigate("/admin/comercios")}
            >
              <FaStore className="profile__admin-banner-icon" />
              <div className="profile__admin-banner-text">
                <p className="profile__admin-banner-label">Gestionar comercios</p>
                <p className="profile__admin-banner-desc">Buscar, activar y patrocinar comercios</p>
              </div>
              <FaArrowRight className="profile__admin-banner-arrow" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
