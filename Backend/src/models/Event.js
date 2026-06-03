import { DataTypes } from "sequelize";
import sequelize from "../config/postgres.js";

const Event = sequelize.define("Event", {
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_kulturklik:      { type: DataTypes.STRING(50), allowNull: false, unique: true },
  municipality_id:    { type: DataTypes.INTEGER, allowNull: false },
  type:               { type: DataTypes.STRING(50) },
  subtipo:            { type: DataTypes.STRING(100) },
  start_date:         { type: DataTypes.DATE, allowNull: false },
  end_date:           { type: DataTypes.DATE, allowNull: false },
  publication_date:   { type: DataTypes.DATE },
  language:           { type: DataTypes.STRING(10) },
  opening_hours:      { type: DataTypes.STRING(100) },
  price_eur:          { type: DataTypes.FLOAT },
  is_free:            { type: DataTypes.BOOLEAN, defaultValue: false },
  is_sponsored:       { type: DataTypes.BOOLEAN, defaultValue: false },
  purchase_url:       { type: DataTypes.TEXT },
  url_event:          { type: DataTypes.TEXT },
  url_online:         { type: DataTypes.TEXT },
  images:             { type: DataTypes.JSONB },
  online:             { type: DataTypes.BOOLEAN, defaultValue: false },
  establishment:      { type: DataTypes.STRING(255) },
  place:              { type: DataTypes.STRING(255) },
  company:            { type: DataTypes.STRING(255) },
  active:             { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at:         { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName:  "events",
  schema:     "market_data",
  timestamps: false,
});

export default Event;
