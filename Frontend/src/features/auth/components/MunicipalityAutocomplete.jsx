import { useState, useRef, useEffect, useId } from 'react'
import { getAll } from '@services/municipalities'
import { useLanguage } from '@shared/context/LanguageContext'

const ALL = getAll()

function filterMunicipalities(query) {
  const q = query.trim().toLowerCase()
  if (!q) return ALL.slice(0, 8)
  const startsWith = ALL.filter(m => m.label.toLowerCase().startsWith(q))
  const contains   = ALL.filter(m => !m.label.toLowerCase().startsWith(q) && m.label.toLowerCase().includes(q))
  return [...startsWith, ...contains].slice(0, 10)
}

export default function MunicipalityAutocomplete({ value, onChange, error, id: propId }) {
  const autoId = useId()
  const id = propId ?? autoId
  const { t } = useLanguage()
  const ta = t.auth

  const selected = ALL.find(m => m.value === value) ?? null
  const [query, setQuery]           = useState('')
  const [open, setOpen]             = useState(false)
  const [highlighted, setHighlighted] = useState(0)

  const inputRef     = useRef(null)
  const listRef      = useRef(null)
  const containerRef = useRef(null)

  const results = open ? filterMunicipalities(query) : []

  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) closeDropdown()
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function closeDropdown() { setOpen(false); setQuery(''); setHighlighted(0) }

  function handleInputChange(e) {
    setQuery(e.target.value)
    setOpen(true)
    setHighlighted(0)
    if (!e.target.value) onChange(null)
  }

  function handleFocus() { setOpen(true); setHighlighted(0) }

  function handleSelect(item) {
    onChange(item.value)
    setOpen(false)
    setQuery('')
    setHighlighted(0)
    inputRef.current?.blur()
  }

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') { setOpen(true); e.preventDefault() }
      return
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[highlighted]) handleSelect(results[highlighted]) }
    else if (e.key === 'Escape') closeDropdown()
  }

  useEffect(() => {
    if (listRef.current && open) listRef.current.children[highlighted]?.scrollIntoView({ block: 'nearest' })
  }, [highlighted, open])

  const displayValue = open ? query : (selected?.label ?? '')

  return (
    <div className="auth-card__field" ref={containerRef}>
      <label htmlFor={id} className="auth-card__label">{ta.municipality}</label>
      <div className="muni-autocomplete">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          autoComplete="off"
          className={`auth-card__input muni-autocomplete__input${error ? ' auth-card__input--error' : ''}`}
          placeholder={ta.municipalityPlaceholder}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />
        {open && results.length > 0 && (
          <ul ref={listRef} id={`${id}-list`} role="listbox" className="muni-autocomplete__list">
            {results.map((item, i) => (
              <li
                key={item.value}
                role="option"
                aria-selected={item.value === value}
                className={`muni-autocomplete__option${i === highlighted ? ' muni-autocomplete__option--highlighted' : ''}${item.value === value ? ' muni-autocomplete__option--selected' : ''}`}
                onMouseDown={e => { e.preventDefault(); handleSelect(item) }}
                onMouseEnter={() => setHighlighted(i)}
              >
                <span className="muni-autocomplete__option-name">{item.label}</span>
                <span className="muni-autocomplete__option-province">{item.province}</span>
              </li>
            ))}
          </ul>
        )}
        {open && query && results.length === 0 && (
          <div className="muni-autocomplete__empty">{ta.municipalityNotFound}</div>
        )}
      </div>
      {error && <span className="auth-card__field-error">{error}</span>}
    </div>
  )
}
