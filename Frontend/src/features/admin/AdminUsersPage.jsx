import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@features/auth/context/AuthContext";
import { getUsers, updateUser, deleteUser } from "@services/admin.api";
import { FaArrowLeft, FaRegUser, FaMagnifyingGlass, FaXmark, FaUsers } from "@ui/icons";
import "./AdminUsersPage.css";

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [acting, setActing]     = useState(null);   // id + acción en curso
  const [confirmId, setConfirmId] = useState(null); // id pendiente de confirmar borrado

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") { navigate("/"); return; }
    setLoading(true);
    getUsers()
      .then(data => setUsers(Array.isArray(data) ? data : data.users ?? []))
      .catch(() => setError("No se pudieron cargar los usuarios."))
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u => {
      const nombre   = (u.nombre   ?? u.name     ?? "").toLowerCase();
      const apellido = (u.apellido ?? u.lastName  ?? "").toLowerCase();
      const email    = (u.email    ?? "").toLowerCase();
      return nombre.includes(q) || apellido.includes(q) || email.includes(q);
    });
  }, [search, users]);

  async function handleRoleToggle(u) {
    const id      = u.id_user ?? u.id;
    const newRole = u.role === "admin" ? "user" : "admin";
    setActing(id + "role");
    try {
      const updated = await updateUser(id, { role: newRole });
      setUsers(prev => prev.map(x => (x.id_user ?? x.id) === id ? { ...x, role: updated.role } : x));
    } catch {
      // sin cambios si falla
    } finally {
      setActing(null);
    }
  }

  async function handleDelete(id) {
    setActing(id + "delete");
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(x => (x.id_user ?? x.id) !== id));
    } catch {
      // sin cambios si falla
    } finally {
      setActing(null);
      setConfirmId(null);
    }
  }

  const selfId = user?.id_user ?? user?.id;

  if (authLoading || loading) {
    return <div className="admin-page"><p className="admin-page__loading">Cargando…</p></div>;
  }

  if (error) {
    return (
      <div className="admin-page">
        <button className="admin-page__back" onClick={() => navigate("/profile")}>
          <FaArrowLeft /> Volver al perfil
        </button>
        <p className="admin-page__error">{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <button className="admin-page__back" onClick={() => navigate("/profile")}>
          <FaArrowLeft /> Volver al perfil
        </button>
        <h1 className="admin-page__title">Gestión de usuarios</h1>
        <p className="admin-page__count">{users.length} usuario{users.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="admin-page__search-wrap">
        <FaMagnifyingGlass className="admin-page__search-icon" />
        <input
          className="admin-page__search"
          type="search"
          placeholder="Buscar por nombre, apellido o email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="admin-page__empty">
          {search ? `Sin resultados para "${search}"` : "No hay usuarios registrados."}
        </p>
      ) : (
        <ul className="admin-users__list">
          {filtered.map(u => {
            const id        = u.id_user ?? u.id;
            const nombre    = u.nombre ?? u.name ?? "—";
            const apellido  = u.apellido ?? u.lastName ?? "";
            const createdAt = u.created_at ?? u.createdAt;
            const isSelf    = id === selfId;
            const isAdmin   = u.role === "admin";
            const pending   = acting?.startsWith(String(id));
            const confirming = confirmId === id;

            return (
              <li key={id} className="admin-users__item">
                <div className="admin-users__avatar">
                  {isAdmin ? <FaUsers /> : <FaRegUser />}
                </div>

                <div className="admin-users__info">
                  <span className="admin-users__name">{nombre} {apellido}</span>
                  <span className="admin-users__email">{u.email}</span>
                  {createdAt && (
                    <span className="admin-users__date">
                      Registrado el {new Date(createdAt).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  )}
                </div>

                <span className={`admin-users__role ${isAdmin ? "admin-users__role--admin" : ""}`}>
                  {isAdmin ? "Admin" : "Usuario"}
                </span>

                {!isSelf && (
                  <div className="admin-users__actions">
                    {/* Promover / degradar rol */}
                    <button
                      className={`admin-users__btn ${isAdmin ? "admin-users__btn--warning" : "admin-users__btn--promote"}`}
                      onClick={() => handleRoleToggle(u)}
                      disabled={pending}
                      title={isAdmin ? "Quitar admin" : "Hacer admin"}
                    >
                      {isAdmin ? "Quitar admin" : "Hacer admin"}
                    </button>

                    {/* Eliminar con confirmación inline */}
                    {!confirming ? (
                      <button
                        className="admin-users__btn admin-users__btn--danger"
                        onClick={() => setConfirmId(id)}
                        disabled={pending}
                        title="Eliminar usuario"
                      >
                        <FaXmark /> Eliminar
                      </button>
                    ) : (
                      <div className="admin-users__confirm">
                        <span className="admin-users__confirm-text">¿Seguro?</span>
                        <button
                          className="admin-users__btn admin-users__btn--danger"
                          onClick={() => handleDelete(id)}
                          disabled={pending}
                        >
                          Sí, eliminar
                        </button>
                        <button
                          className="admin-users__btn admin-users__btn--ghost"
                          onClick={() => setConfirmId(null)}
                          disabled={pending}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
