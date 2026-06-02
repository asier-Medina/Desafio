import { Outlet } from "react-router";
import Header from "@shared/components/Header/Header.jsx";

export default function MainLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}
