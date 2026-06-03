import { DataTypes } from "sequelize";
import sequelize from "../config/postgres.js";

import User from "./User.js";
import Culture from "./Culture.js";
import Gastronomy from "./Gastronomy.js";
import Event from "./Event.js";
import Interest from "./Interest.js"; 
import Preferences from "./Preference.js"; 
import Favorite from "./Favorite.js"; 
import UserInterest from "./UserInterest.js"; 
import GastronomyReview from "./GastronomyReview.js"; 
import CultureReview from "./CultureReview.js"; 
import EventReview from "./EventReview.js"; 
import Municipality from "./Municipality.js";


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
