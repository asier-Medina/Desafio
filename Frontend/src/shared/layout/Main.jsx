import { Outlet, useNavigate, useLocation } from "react-router";
import Header from "@shared/components/Header/Header.jsx";
import MobileNav from "@shared/components/MobileNav/MobileNav";
import { FavoritesProvider } from "@shared/context/FavoritesContext";

export default function MainLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <FavoritesProvider>
      <Header onNavigate={navigate} />
      <main>
        <Outlet />
      </main>
      <MobileNav onNavigate={navigate} currentPath={pathname} />
    </FavoritesProvider>
  );
}
