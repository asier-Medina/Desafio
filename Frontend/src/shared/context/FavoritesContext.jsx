import { createContext, useContext, useState, useCallback } from "react";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  const addFavorite = useCallback((item) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === item.id && f._variant === item._variant)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeFavorite = useCallback((id, variant) => {
    setFavorites((prev) => prev.filter((f) => !(f.id === id && f._variant === variant)));
  }, []);

  const isFavorite = useCallback((id, variant) => {
    return favorites.some((f) => f.id === id && f._variant === variant);
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}
