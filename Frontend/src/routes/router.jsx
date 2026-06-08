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
import ProfileAccount from "@features/profile/ProfileAccount";
import AdminComerciosPage from "@features/admin/AdminComerciosPage";
import AdminUsersPage from "@features/admin/AdminUsersPage";
import RequireAuth from "@shared/components/RequireAuth/RequireAuth";
import { FaRegHeart, FaRegUser } from "@ui/icons";

import MainLayout from "@shared/layout/Main";

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
    children: [
      {
        index: true,
        element: (
          <RequireAuth icon={FaRegUser} variant="profile">
            <Profile />
          </RequireAuth>
        ),
      },
      {
        path: "account",
        element: (
          <RequireAuth icon={FaRegUser} variant="profile">
            <ProfileAccount />
          </RequireAuth>
        ),
      },
    ],
  },
  {
    path: "/favoritos",
    element: <MainLayout />,
    children: [{
      index: true,
      element: (
        <RequireAuth icon={FaRegHeart} variant="favorites">
          <Favorite />
        </RequireAuth>
      ),
    }],
  },
  {
    path: "/admin",
    element: <MainLayout />,
    children: [
      {
        path: "usuarios",
        element: (
          <RequireAuth icon={FaRegUser} variant="admin">
            <AdminUsersPage />
          </RequireAuth>
        ),
      },
      {
        path: "comercios",
        element: (
          <RequireAuth icon={FaRegUser} variant="admin">
            <AdminComerciosPage />
          </RequireAuth>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <MainLayout />,
    children: [{ index: true, element: <Auth /> }],
  },
]);

export default router;
