import { Outlet, useNavigate, useLocation } from "react-router";
import Header from "@shared/components/Header/Header.jsx";
import MobileNav from "@shared/MobileNav/MobileNav";

export default function MainLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <>
      <Header onNavigate={navigate} />
      <main>
        <Outlet />
      </main>
      <MobileNav onNavigate={navigate} currentPath={pathname} />
    </>
  );
}
