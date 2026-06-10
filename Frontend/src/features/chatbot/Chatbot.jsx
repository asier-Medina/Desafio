import { useState, useRef, useEffect, useId } from 'react'
import { useNavigate } from 'react-router'
import { sendMessage } from '@services/chat.api'
import './Chatbot.css'

const SESSION_ID = `session-${Date.now()}`

const ROUTE_MAP = {
  gastro:  (id) => `/gastronomy/${id}`,
  cultura: (id) => `/culture/${id}`,
  evento:  (id) => `/events/${id}`,
}

export default function Chatbot() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Soy tu asistente de SustraiApp. Pregúntame por gastronomía, cultura o eventos en el País Vasco.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const panelId = useId()

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [open, messages])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const data = await sendMessage({ message: text, sessionId: SESSION_ID })
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: data.suggestion, items: data.items ?? [], aviso: data.aviso }
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Lo siento, ha ocurrido un error. Inténtalo de nuevo.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleItemClick(item) {
    const toRoute = ROUTE_MAP[item.subtipo]
    if (toRoute) {
      setOpen(false)
      navigate(toRoute(item.item_id))
    }
  }

  return (
    <>
      {open && (
        <div
          className="chatbot__backdrop"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="chatbot">
        {open && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Asistente SustraiApp"
            id={panelId}
            className="chatbot__panel"
          >
            <div className="chatbot__header">
              <span className="chatbot__title">Asistente</span>
              <button
                type="button"
                className="chatbot__close"
                onClick={() => setOpen(false)}
                aria-label="Cerrar chat"
              >
                ✕
              </button>
            </div>

            <div className="chatbot__messages" aria-live="polite">
              {messages.map((msg, i) => (
                <div key={i} className={`chatbot__bubble chatbot__bubble--${msg.role}`}>
                  <p className="chatbot__text">{msg.text}</p>
                  {msg.aviso && <p className="chatbot__aviso">{msg.aviso}</p>}
                  {msg.items?.length > 0 && (
                    <ul className="chatbot__items">
                      {msg.items.map((item) => (
                        <li key={`${item.subtipo}-${item.item_id}`}>
                          <button
                            type="button"
                            className="chatbot__item"
                            onClick={() => handleItemClick(item)}
                          >
                            <span className="chatbot__item-name">{item.nombre}</span>
                            <span className="chatbot__item-meta">
                              {item.categoria} · {item.provincia} · ⭐ {item.estrella_prevista.toFixed(1)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              {loading && (
                <div className="chatbot__bubble chatbot__bubble--assistant">
                  <span className="chatbot__typing">
                    <span /><span /><span />
                  </span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="chatbot__form">
              <input
                ref={inputRef}
                type="text"
                className="chatbot__input"
                placeholder="Escribe tu consulta…"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                aria-label="Mensaje para el asistente"
              />
              <button
                type="submit"
                className="chatbot__send"
                disabled={loading || !input.trim()}
                aria-label="Enviar mensaje"
              >
                ➤
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          className="chatbot__fab"
          onClick={() => setOpen(o => !o)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
        >
          {open ? '✕' : '💬'}
        </button>
      </div>
    </>
  )
}
