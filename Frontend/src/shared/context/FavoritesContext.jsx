import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@features/auth/context/AuthContext";
import * as favoritesApi from "@services/favorites.api";
import * as eventsApi from "@services/events.api";
import * as gastronomyApi from "@services/gastronomy.api";
import * as cultureApi from "@services/culture.api";

const FavoritesContext = createContext(null);

const VARIANT_TO_TIPO = { event: 'evento', gastronomy: 'gastronomia', culture: 'cultura' };
const TIPO_TO_VARIANT = { evento: 'event', gastronomia: 'gastronomy', cultura: 'culture' };
const API_BY_TIPO     = { evento: eventsApi, gastronomia: gastronomyApi, cultura: cultureApi };

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  // Carga favoritos desde la BD al iniciar sesión
  useEffect(() => {
    if (!user) { setFavorites([]); return; }
    let cancelled = false;
    async function load() {
      try {
        const rows = await favoritesApi.list();
        if (cancelled) return;
        const items = await Promise.all(
          rows.map(async (row) => {
            const variant = TIPO_TO_VARIANT[row.entidad_tipo];
            const api = API_BY_TIPO[row.entidad_tipo];
            if (!api || !variant) return null;
            try {
              const data = await api.getById(row.entidad_id);
              return { ...data, _variant: variant };
            } catch {
              // Si no se pueden cargar los datos completos, guardamos el ID
              // para que isFavorite() funcione igualmente
              return { id: row.entidad_id, _variant: variant };
            }
          })
        );
        if (!cancelled) {
          setFavorites(items.filter(Boolean));
        }
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  const addFavorite = useCallback(async (item) => {
    if (!user) return;
    const entidad_tipo = VARIANT_TO_TIPO[item._variant];
    if (!entidad_tipo) return;
    // Optimistic update
    setFavorites(prev => {
      if (prev.some(f => f.id === item.id && f._variant === item._variant)) return prev;
      return [...prev, item];
    });
    try {
      await favoritesApi.add(item.id, entidad_tipo);
    } catch (err) {
      if (err.message === 'Ya existe en favoritos') return;
      // Rollback
      setFavorites(prev => prev.filter(f => !(f.id === item.id && f._variant === item._variant)));
    }
  }, [user]);

  const removeFavorite = useCallback(async (id, variant) => {
    const entidad_tipo = VARIANT_TO_TIPO[variant];
    const removed = favorites.find(f => f.id === id && f._variant === variant);
    // Optimistic update
    setFavorites(prev => prev.filter(f => !(f.id === id && f._variant === variant)));
    if (!entidad_tipo || !user) return;
    try {
      await favoritesApi.remove(entidad_tipo, id);
    } catch {
      // Rollback
      if (removed) setFavorites(prev => [...prev, removed]);
    }
  }, [favorites, user]);

  const isFavorite = useCallback((id, variant) => {
    return favorites.some(f => f.id === id && f._variant === variant);
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, user }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}