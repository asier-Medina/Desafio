import { Outlet } from "react-router";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";

export default function Main() {
  return (
    <>
      <Header lang="es" />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}