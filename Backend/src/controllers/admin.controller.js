import User from "../models/User.js";
import { Gastronomy, Municipality } from "../models/index.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password_hash"] },
      order: [["created_at", "DESC"]],
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getComercio = async (req, res) => {
  try {
    const comercios = await Gastronomy.findAll({
      include: [{ model: Municipality, attributes: ["nombre", "provincia"] }],
      order: [["nombre", "ASC"]],
    });
    res.json(comercios);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const u = await User.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: "Usuario no encontrado" });

    if (u.id_user === req.user.id_user)
      return res.status(400).json({ error: "No puedes modificar tu propia cuenta desde aquí" });

    const allowed = {};
    if (req.body.role === "admin" || req.body.role === "user") allowed.role = req.body.role;

    if (Object.keys(allowed).length === 0)
      return res.status(400).json({ error: "Nada que actualizar" });

    await u.update(allowed);
    res.json({ id_user: u.id_user, role: u.role });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const u = await User.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: "Usuario no encontrado" });

    if (u.id_user === req.user.id_user)
      return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });

    await u.destroy();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const updateComercio = async (req, res) => {
  try {
    const item = await Gastronomy.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Comercio no encontrado" });

    const allowed = {};
    if (typeof req.body.active       === "boolean") allowed.active       = req.body.active;
    if (typeof req.body.is_sponsored === "boolean") allowed.is_sponsored = req.body.is_sponsored;

    if (Object.keys(allowed).length === 0)
      return res.status(400).json({ error: "Nada que actualizar" });

    await item.update(allowed);
    res.json({ id: item.id, active: item.active, is_sponsored: item.is_sponsored });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
