import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "@features/auth/context/AuthContext";
import Header from "@shared/components/Header/Header.jsx";
import MobileNav from "@shared/components/MobileNav/MobileNav";
import { FavoritesProvider } from "@shared/context/FavoritesContext";
import { LanguageProvider, useLanguage } from "@features/language/LanguageContext";

function LayoutInner() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <FavoritesProvider>
      <Header
        user={user}
        onLogin={() => navigate("/login")}
        onRegister={() => navigate("/login")}
        onLogout={handleLogout}
        onNavigate={navigate}
        lang={language}
        onLangChange={setLanguage}
      />
      <main>
        <Outlet />
      </main>
      <MobileNav
        onNavigate={navigate}
        currentPath={pathname}
        lang={language}
        hidden={pathname === "/login"}
      />
    </FavoritesProvider>
  );
}

export default function MainLayout() {
  return (
    <LanguageProvider>
      <LayoutInner />
    </LanguageProvider>
  );
}
