import { DataTypes } from "sequelize";
import sequelize from "../config/postgres.js";

const Culture = sequelize.define("Culture", {
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  google_place_id:      { type: DataTypes.STRING(100), unique: true },
  kulturklik_id:        { type: DataTypes.STRING(50), unique: true },
  fuente:               { type: DataTypes.STRING(50), allowNull: false, defaultValue: "Open Data" },
  nombre:               { type: DataTypes.STRING(255), allowNull: false },
  tipo_lugar:           { type: DataTypes.STRING(100), allowNull: false },
  tipo_cultura:         { type: DataTypes.STRING(100) },
  descripcion:          { type: DataTypes.TEXT },
  precio:               { type: DataTypes.STRING(100) },
  horario:              { type: DataTypes.JSONB },
  telefono:             { type: DataTypes.STRING(50) },
  email:                { type: DataTypes.STRING(100) },
  web:                  { type: DataTypes.STRING(255) },
  web_amigable:         { type: DataTypes.STRING(255) },
  imagen_url:           { type: DataTypes.TEXT },
  municipality_id:      { type: DataTypes.INTEGER, allowNull: false },
  direccion:            { type: DataTypes.STRING(255) },
  codigo_postal:        { type: DataTypes.STRING(10) },
  visita_guiada:        { type: DataTypes.BOOLEAN, defaultValue: false },
  capacidad:            { type: DataTypes.INTEGER },
  tienda:               { type: DataTypes.BOOLEAN, defaultValue: false },
  lat:                  { type: DataTypes.FLOAT, allowNull: false },
  lng:                  { type: DataTypes.FLOAT, allowNull: false },
  valoracion:           { type: DataTypes.FLOAT },
  numero_valoraciones:  { type: DataTypes.INTEGER },
  is_sponsored:         { type: DataTypes.BOOLEAN, defaultValue: false },
  active:               { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at:           { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName:  "culture",
  schema:     "market_data",
  timestamps: false,
});

export default Culture;
