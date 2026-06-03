import { DataTypes } from "sequelize";
import sequelize from "../config/postgres.js";

import User from "./User.js";
import Culture from "./Culture.js";
import Gastronomy from "./Gastronomy.js";
import Event from "./Event.js";

// ─── shared.municipalities ───────────────────────────────────────────────────

const Municipality = sequelize.define("Municipality", {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre:         { type: DataTypes.STRING(100), allowNull: false },
  provincia:      { type: DataTypes.STRING(50), allowNull: false },
  nora_code:      { type: DataTypes.STRING(20), unique: true },
  province_code:  { type: DataTypes.STRING(5) },
  lat:            { type: DataTypes.FLOAT },
  lng:            { type: DataTypes.FLOAT },
}, { tableName: "municipalities", schema: "shared", timestamps: false });

// ─── user_data.interests ──────────────────────────────────────────────────────

const Interest = sequelize.define("Interest", {
  id_interes: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre:     { type: DataTypes.STRING(100), allowNull: false },
  father_id:  { type: DataTypes.INTEGER },
  level:      { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, { tableName: "interests", schema: "user_data", timestamps: false });

// ─── user_data.user_interests (tabla pivote) ──────────────────────────────────

const UserInterest = sequelize.define("UserInterest", {
  id_user:    { type: DataTypes.INTEGER, primaryKey: true },
  id_interes: { type: DataTypes.INTEGER, primaryKey: true },
}, { tableName: "user_interests", schema: "user_data", timestamps: false });

// ─── user_data.preferences ───────────────────────────────────────────────────

const Preferences = sequelize.define("Preferences", {
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:            { type: DataTypes.INTEGER, allowNull: false, unique: true },
  rango_precio:       { type: DataTypes.STRING(10) },
  movilidad_reducida: { type: DataTypes.BOOLEAN, defaultValue: false },
  municipios_interes: { type: DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: [] },
  updated_at:         { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: "preferences", schema: "user_data", timestamps: false });

// ─── user_data.event_reviews ──────────────────────────────────────────────────

const EventReview = sequelize.define("EventReview", {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  event_id:   { type: DataTypes.INTEGER, allowNull: false },
  puntuacion: { type: DataTypes.INTEGER, allowNull: false },
  texto:      { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: "event_reviews", schema: "user_data", timestamps: false });

// ─── user_data.gastronomy_reviews ─────────────────────────────────────────────

const GastronomyReview = sequelize.define("GastronomyReview", {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  gastro_id:  { type: DataTypes.INTEGER, allowNull: false },
  puntuacion: { type: DataTypes.INTEGER, allowNull: false },
  texto:      { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: "gastronomy_reviews", schema: "user_data", timestamps: false });

// ─── user_data.culture_reviews ────────────────────────────────────────────────

const CultureReview = sequelize.define("CultureReview", {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  culture_id: { type: DataTypes.INTEGER, allowNull: false },
  puntuacion: { type: DataTypes.INTEGER, allowNull: false },
  texto:      { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: "culture_reviews", schema: "user_data", timestamps: false });

// ─── user_data.favorites ──────────────────────────────────────────────────────

const Favorite = sequelize.define("Favorite", {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:      { type: DataTypes.INTEGER, allowNull: false },
  entidad_id:   { type: DataTypes.INTEGER, allowNull: false },
  entidad_tipo: { type: DataTypes.STRING(20), allowNull: false },
  created_at:   { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: "favorites", schema: "user_data", timestamps: false });

// =============================================================================
// RELACIONES
// =============================================================================

// Municipality ↔ User / Culture / Gastronomy / Event
Municipality.hasMany(User,       { foreignKey: "municipality_id" });
User.belongsTo(Municipality,     { foreignKey: "municipality_id" });

Municipality.hasMany(Culture,    { foreignKey: "municipality_id" });
Culture.belongsTo(Municipality,  { foreignKey: "municipality_id" });

Municipality.hasMany(Gastronomy, { foreignKey: "municipality_id" });
Gastronomy.belongsTo(Municipality, { foreignKey: "municipality_id" });

Municipality.hasMany(Event,      { foreignKey: "municipality_id" });
Event.belongsTo(Municipality,    { foreignKey: "municipality_id" });

// User ↔ Interests (M:N)
User.belongsToMany(Interest, { through: UserInterest, foreignKey: "id_user",    otherKey: "id_interes" });
Interest.belongsToMany(User, { through: UserInterest, foreignKey: "id_interes", otherKey: "id_user" });

// Interest → self (árbol padre/hijo)
Interest.hasMany(Interest,    { as: "children", foreignKey: "father_id" });
Interest.belongsTo(Interest,  { as: "parent",   foreignKey: "father_id" });

// User ↔ Preferences (1:1)
User.hasOne(Preferences,       { foreignKey: "user_id" });
Preferences.belongsTo(User,    { foreignKey: "user_id" });

// User ↔ EventReview / GastronomyReview / CultureReview
User.hasMany(EventReview,      { foreignKey: "user_id" });
EventReview.belongsTo(User,    { foreignKey: "user_id" });

Event.hasMany(EventReview,     { foreignKey: "event_id" });
EventReview.belongsTo(Event,   { foreignKey: "event_id" });

User.hasMany(GastronomyReview,     { foreignKey: "user_id" });
GastronomyReview.belongsTo(User,   { foreignKey: "user_id" });

Gastronomy.hasMany(GastronomyReview,     { foreignKey: "gastro_id" });
GastronomyReview.belongsTo(Gastronomy,   { foreignKey: "gastro_id" });

User.hasMany(CultureReview,    { foreignKey: "user_id" });
CultureReview.belongsTo(User,  { foreignKey: "user_id" });

Culture.hasMany(CultureReview,   { foreignKey: "culture_id" });
CultureReview.belongsTo(Culture, { foreignKey: "culture_id" });

// User ↔ Favorites
User.hasMany(Favorite,   { foreignKey: "user_id" });
Favorite.belongsTo(User, { foreignKey: "user_id" });

// =============================================================================

export {
  sequelize,
  Municipality,
  User,
  Interest,
  UserInterest,
  Preferences,
  Culture,
  Gastronomy,
  Event,
  EventReview,
  GastronomyReview,
  CultureReview,
  Favorite,
};
