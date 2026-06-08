import { useState, useEffect } from 'react'
import { getInterestsCatalog, updateInterests, updatePreferences } from '@services/user.service'
import { getAll as getMunicipalities } from '@services/municipalities'
import { useLanguage } from '@shared/context/LanguageContext'

function buildTree(items) {
  const map = {}
  items.forEach(i => { map[i.id_interes] = { ...i, children: [] } })
  const roots = []
  items.forEach(i => {
    if (i.father_id != null && map[i.father_id]) {
      map[i.father_id].children.push(map[i.id_interes])
    } else if (i.father_id == null) {
      roots.push(map[i.id_interes])
    }
  })
  return roots
}

function Chip({ label, selected, onToggle }) {
  return (
    <button
      type="button"
      className={`onboarding__chip${selected ? ' onboarding__chip--selected' : ''}`}
      onClick={onToggle}
    >
      {label}
    </button>
  )
}

function InterestNode({ node, selected, onToggle }) {
  if (node.children.length === 0) {
    return (
      <Chip
        label={node.nombre}
        selected={selected.includes(node.id_interes)}
        onToggle={() => onToggle(node.id_interes)}
      />
    )
  }
  return (
    <div className="onboarding__subcategory">
      <p className="onboarding__subcategory-title">{node.nombre}</p>
      <div className="onboarding__chips">
        {node.children.map(child => (
          <InterestNode key={child.id_interes} node={child} selected={selected} onToggle={onToggle} />
        ))}
      </div>
    </div>
  )
}

export default function OnboardingForm({ onSuccess, onSkip }) {
  const { t } = useLanguage()
  const ta = t.auth

  const PRECIO_OPTIONS = [
    { value: 'bajo',  label: ta.priceEconomic },
    { value: 'medio', label: ta.priceStandard },
    { value: 'alto',  label: ta.pricePremium },
  ]

  const [tree, setTree] = useState([])
  const [selected, setSelected] = useState([])
  const [rango, setRango] = useState('')
  const [movilidad, setMovilidad] = useState(false)
  const [municipios, setMunicipios] = useState([])
  const [loading, setLoading] = useState(false)
  const municipalities = getMunicipalities()

  useEffect(() => {
    getInterestsCatalog()
      .then(data => setTree(buildTree(data)))
      .catch(() => {})
  }, [])

  function toggleInterest(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function toggleMunicipio(id) {
    setMunicipios(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await Promise.all([
        selected.length > 0 ? updateInterests(selected) : Promise.resolve(),
        (rango || movilidad || municipios.length > 0)
          ? updatePreferences({ rango_precio: rango || undefined, movilidad_reducida: movilidad, municipios_interes: municipios })
          : Promise.resolve(),
      ])
      onSuccess()
    } catch {
      onSuccess()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="onboarding-form" noValidate>
      {tree.length > 0 && (
        <section className="onboarding__section">
          <h3 className="onboarding__section-title">{ta.interestsTitle}</h3>
          <p className="onboarding__section-hint">{ta.interestsHint}</p>
          {tree.map(root => (
            <div key={root.id_interes} className="onboarding__category">
              <h4 className="onboarding__category-title">{root.nombre}</h4>
              <div className="onboarding__chips">
                {root.children.map(child => (
                  <InterestNode key={child.id_interes} node={child} selected={selected} onToggle={toggleInterest} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="onboarding__divider" />

      <section className="onboarding__section">
        <h3 className="onboarding__section-title">{ta.preferencesTitle}</h3>

        <div className="onboarding__pref-block">
          <p className="onboarding__pref-label">{ta.priceRange}</p>
          <div className="onboarding__btn-group">
            {PRECIO_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`onboarding__btn-option${rango === opt.value ? ' onboarding__btn-option--selected' : ''}`}
                onClick={() => setRango(prev => prev === opt.value ? '' : opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="onboarding__pref-block">
          <label className="onboarding__checkbox-row">
            <input
              type="checkbox"
              checked={movilidad}
              onChange={e => setMovilidad(e.target.checked)}
            />
            <span>{ta.accessibilityLabel}</span>
          </label>
        </div>

        <div className="onboarding__pref-block">
          <p className="onboarding__pref-label">{ta.municipalitiesInterest}</p>
          <div className="onboarding__chips onboarding__chips--wrap">
            {municipalities.map(m => (
              <Chip
                key={m.value}
                label={m.label}
                selected={municipios.includes(m.value)}
                onToggle={() => toggleMunicipio(m.value)}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="onboarding__actions">
        <button type="button" className="onboarding__skip-btn" onClick={onSkip}>
          {ta.skip}
        </button>
        <button type="submit" className="onboarding__submit-btn" disabled={loading}>
          {loading ? <span className="onboarding__spinner" /> : ta.saveAndContinue}
        </button>
      </div>
    </form>
  )
}
