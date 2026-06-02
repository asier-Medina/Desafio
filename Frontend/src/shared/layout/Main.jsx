import { Outlet } from "react-router";
import Header from "@shared/components/Header/Header.jsx";

export default function MainLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
