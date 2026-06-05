import { createBrowserRouter } from "react-router";
import Home from "@features/home/Home";
import Events from "@features/events/Events";
import EventDetail from "@features/events/EventDetail";
import Auth from "@features/auth/Auth";
import Culture from "@features/culture/Culture";
import CultureDetail from "@features/culture/CultureDetail";
import Gastronomy from "@features/gastronomy/Gastronomy";
import GastronomyDetail from "@features/gastronomy/GastronomyDetail";
import Favorite from "@features/favorite/Favorite";
import Profile from "@features/profile/Profile";

import MainLayout from "@shared/layout/Main";

//import { isAuthenticated } from "@services/auth.services.js";

/*export async function mainLoader() {
  const hasAccess = isAuthenticated();

  if (!hasAccess) {
    return redirect("/login");
  }

  return hasAccess;
}*/

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [{ index: true, element: <Home /> }],
  },
  {
    path: "/culture",
    element: <MainLayout />,
    children: [
      { index: true, element: <Culture /> },
      { path: ":id", element: <CultureDetail /> },
    ],
  },
  {
    path: "/gastronomy",
    element: <MainLayout />,
    children: [
      { index: true, element: <Gastronomy /> },
      { path: ":id", element: <GastronomyDetail /> },
    ],
  },
  {
    path: "/events",
    element: <MainLayout />,
    children: [
      { index: true, element: <Events /> },
      { path: ":id", element: <EventDetail /> },
    ],
  },
  {
    path: "/profile",
    element: <MainLayout />,
    children: [{ index: true, element: <Profile /> }],
    /*loader: mainLoader,*/
  },
  {
    path: "/favoritos",
    element: <MainLayout />,
    children: [{ index: true, element: <Favorite /> }],
  },

  {
    path: "/login",
    element: <MainLayout />,
    children: [{ index: true, element: <Auth /> }],
  },
  /* {
    path: "/dashboard",
    element: <DashboardLayout />,
    /*loader: mainLoader,*/
    /* children: [
      { index: true, element: <DashboardHome /> },
      { path: "shelters", element: <SheltersManagement /> },
      { path: "animals", element: <AnimalsManagement /> },
      { path: "users", element: <UsersManagement /> },
      { path: "requests", element: <RequestsManagement /> },
      { path: "sponsorships", element: <SponsorshipsManagement /> },
    ],
  }, 
  */

]);

export default router;