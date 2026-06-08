import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import Button from "@ui/Button";
import InputField from "@features/auth/components/InputField";
import SelectField from "@features/auth/components/SelectField";
import MunicipalityAutocomplete from "@features/auth/components/MunicipalityAutocomplete";
import { useAuth } from "@features/auth/context/AuthContext";
import { getNameById, getAll as getMunicipalities } from "@services/municipalities";
import {
  getInterestsCatalog, getMyInterests, getMyPreferences,
  updateMe, updateInterests, updatePreferences,
} from "@services/user.service";
import { FaArrowLeft, FaPen, FaCheck, FaXmark } from "@ui/icons";
import "./Profile.css";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

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

function InterestChip({ label, selected, onToggle, readOnly }) {
  if (readOnly) return <span className="profile-account__chip">{label}</span>;
  return (
    <button
      type="button"
      className={`profile-account__chip-btn${selected ? " profile-account__chip-btn--on" : ""}`}
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
    <div className="profile-account__interest-sub">
      <p className="profile-account__interest-sub-label">{node.nombre}</p>
      <div className="profile-account__chips profile-account__chips--sub">
        {node.children.map(c => (
          <InterestNode key={c.id_interes} node={c} selectedIds={selectedIds} onToggle={onToggle} readOnly={readOnly} />
        ))}
      </div>
    </div>
  );
}

export default function ProfileAccount() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = user;
  const allMunis = getMunicipalities();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: profile?.name || "",
    municipality_id: profile?.municipality_id || null,
    sexo: profile?.sexo || "",
    age: profile?.age || "",
  });

  const [catalog, setCatalog] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editIds, setEditIds] = useState([]);

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
    }).finally(() => setLoading(false));
  }, [userId]);

  function startEdit() {
    setForm({
      name: profile?.name || "",
      municipality_id: profile?.municipality_id || null,
      sexo: profile?.sexo || "",
      age: profile?.age || "",
    });
    setEditIds([...selectedIds]);
    setEditPrefs({ ...prefs });
    setEditing(true);
  }

  function cancelEdit() { setEditing(false); }

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
    const body = {};
    if (form.name) body.nombre = form.name;
    if (form.municipality_id) body.municipality_id = form.municipality_id;
    if (form.sexo) body.sexo = form.sexo;
    if (form.age) body.age = Number(form.age);

    const [, interestsOk, prefsOk] = await Promise.allSettled([
      Object.keys(body).length > 0 ? updateMe(body) : Promise.resolve(),
      updateInterests(editIds),
      updatePreferences({
        rango_precio: editPrefs.rango_precio || undefined,
        movilidad_reducida: editPrefs.movilidad_reducida,
        municipios_interes: editPrefs.municipios_interes,
      }),
    ]);

    if (interestsOk.status === 'fulfilled') setSelectedIds(editIds);
    if (prefsOk.status === 'fulfilled') setPrefs({ ...editPrefs });
    setSaving(false);
    setEditing(false);
  }

  const interestGroups = groupSelected(catalog, selectedIds);
  const hasInterests = interestGroups.some(g => g.items.length > 0);
  const hasPrefs = prefs.rango_precio || prefs.movilidad_reducida || prefs.municipios_interes.length > 0;
  const selectedMuniNames = prefs.municipios_interes.map(id => getNameById(id)).filter(Boolean);

  return (
    <div className="profile-account container">

      <motion.div
        className="profile-account__header"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <button className="profile-account__back" type="button" onClick={() => navigate("/profile")}>
          <FaArrowLeft />
        </button>
        <h1 className="profile-account__title">Mi cuenta</h1>
        {!editing && (
          <Button variant="outline" size="sm" onClick={startEdit}>
            <FaPen /> Editar
          </Button>
        )}
        {editing && (
          <div className="profile-account__header-actions">
            <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={saving}>
              <FaXmark /> Cancelar
            </Button>
            <Button variant="soft" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando…" : <><FaCheck /> Guardar</>}
            </Button>
          </div>
        )}
      </motion.div>

      <motion.div
        className="profile-account__section"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <h2 className="profile-account__section-title">Información personal</h2>
        {editing ? (
          <div className="profile-account__form">
            <InputField label="Nombre" id="edit-name" type="text" value={form.name} onChange={handleFormChange("name")} maxLength={100} />
            <MunicipalityAutocomplete id="edit-municipality" value={form.municipality_id} onChange={v => setForm(prev => ({ ...prev, municipality_id: v }))} />
            <SelectField label="Sexo" id="edit-sexo" options={SEXO_OPTS} value={form.sexo} onChange={handleFormChange("sexo")} />
            <InputField label="Edad" id="edit-age" type="number" value={form.age} onChange={handleFormChange("age")} min={1} max={119} />
          </div>
        ) : (
          <dl className="profile-account__info-list">
            <div className="profile-account__info-row"><dt>Email</dt><dd>{profile?.email || "—"}</dd></div>
            {profile?.municipality_id && <div className="profile-account__info-row"><dt>Municipio</dt><dd>{getNameById(user?.municipality_id)}</dd></div>}
            {user?.sexo && <div className="profile-account__info-row"><dt>Sexo</dt><dd>{SEXO_OPTS.find(o => o.value === profile?.sexo)?.label ?? profile?.sexo}</dd></div>}
            {profile?.age && <div className="profile-account__info-row"><dt>Edad</dt><dd>{profile.age} años</dd></div>}
            {user?.createdAt && <div className="profile-account__info-row"><dt>Miembro desde</dt><dd>{new Date(user.createdAt).toLocaleDateString("es", { year: "numeric", month: "long" })}</dd></div>}
          </dl>
        )}
      </motion.div>

      <motion.div
        className="profile-account__section"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <h2 className="profile-account__section-title">Intereses</h2>
        {editing ? (
          loading ? <p className="profile-account__empty">Cargando…</p>
          : catalog.length === 0 ? <p className="profile-account__empty">No se pudo cargar el catálogo de intereses.</p>
          : (
            <div className="profile-account__tree">
              {catalog.map(root => (
                <div key={root.id_interes} className="profile-account__cat">
                  <h3 className="profile-account__cat-title">{root.nombre}</h3>
                  <div className="profile-account__chips">
                    {root.children.map(child => (
                      <InterestNode key={child.id_interes} node={child} selectedIds={editIds} onToggle={toggleInterest} readOnly={false} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : loading ? <p className="profile-account__empty">Cargando…</p>
        : hasInterests ? (
          <div className="profile-account__tree">
            {interestGroups.map(g => g.items.length > 0 && (
              <div key={g.label} className="profile-account__cat">
                <h3 className="profile-account__cat-title">{g.label}</h3>
                <div className="profile-account__chips">
                  {g.items.map(name => <span key={name} className="profile-account__chip">{name}</span>)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="profile-account__empty">
            Aún no has añadido intereses.{" "}
            <button className="profile-account__link" onClick={startEdit}>Añadir ahora</button>
          </p>
        )}
      </motion.div>

      <motion.div
        className="profile-account__section"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        <h2 className="profile-account__section-title">Preferencias</h2>
        {editing ? (
          <div className="profile-account__form">
            <div className="profile-account__pref">
              <p className="profile-account__pref-label">Rango de precio</p>
              <div className="profile-account__btn-group">
                {PRECIO_OPTS.map(opt => (
                  <button key={opt.value} type="button"
                    className={`profile-account__btn${editPrefs.rango_precio === opt.value ? " profile-account__btn--on" : ""}`}
                    onClick={() => setEditPrefs(prev => ({ ...prev, rango_precio: prev.rango_precio === opt.value ? "" : opt.value }))}
                  >{opt.label}</button>
                ))}
              </div>
            </div>
            <div className="profile-account__pref">
              <label className="profile-account__check">
                <input type="checkbox" checked={editPrefs.movilidad_reducida}
                  onChange={e => setEditPrefs(prev => ({ ...prev, movilidad_reducida: e.target.checked }))} />
                <span>Necesito accesibilidad para movilidad reducida</span>
              </label>
            </div>
            <div className="profile-account__pref">
              <p className="profile-account__pref-label">Municipios de interés</p>
              <div className="profile-account__chips profile-account__chips--scroll">
                {allMunis.map(m => (
                  <button key={m.value} type="button"
                    className={`profile-account__chip-btn${editPrefs.municipios_interes.includes(m.value) ? " profile-account__chip-btn--on" : ""}`}
                    onClick={() => toggleMuni(m.value)}
                  >{m.label}</button>
                ))}
              </div>
            </div>
          </div>
        ) : loading ? <p className="profile-account__empty">Cargando…</p>
        : hasPrefs ? (
          <dl className="profile-account__info-list">
            {prefs.rango_precio && <div className="profile-account__info-row"><dt>Precio</dt><dd>{PRECIO_OPTS.find(o => o.value === prefs.rango_precio)?.label}</dd></div>}
            {prefs.movilidad_reducida && <div className="profile-account__info-row"><dt>Accesibilidad</dt><dd>Movilidad reducida</dd></div>}
            {selectedMuniNames.length > 0 && <div className="profile-account__info-row"><dt>Municipios</dt><dd>{selectedMuniNames.join(", ")}</dd></div>}
          </dl>
        ) : (
          <p className="profile-account__empty">
            Aún no has configurado tus preferencias.{" "}
            <button className="profile-account__link" onClick={startEdit}>Añadir ahora</button>
          </p>
        )}
      </motion.div>

    </div>
  );
}
