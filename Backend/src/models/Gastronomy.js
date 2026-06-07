import { DataTypes } from "sequelize";
import sequelize from "../config/postgres.js";

const Gastronomy = sequelize.define("Gastronomy", {
  id:                     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  external_id:            { type: DataTypes.STRING(100), unique: true },
  nombre:                 { type: DataTypes.STRING(255), allowNull: false },
  descripcion:            { type: DataTypes.TEXT },
  municipality_id:        { type: DataTypes.INTEGER, allowNull: false },
  lat:                    { type: DataTypes.FLOAT },
  lng:                    { type: DataTypes.FLOAT },
  type:                   { type: DataTypes.STRING(50) },
  tipo_comida:            { type: DataTypes.STRING(100) },
  entorno:                { type: DataTypes.STRING(100) },
  email:                  { type: DataTypes.STRING(100) },
  web:                    { type: DataTypes.TEXT },
  web_euskadi:            { type: DataTypes.TEXT },
  categoria:              { type: DataTypes.STRING(50) },
  calidad:                { type: DataTypes.BOOLEAN, defaultValue: false },
  url_imagen:             { type: DataTypes.TEXT },
  valoracion:             { type: DataTypes.FLOAT },
  num_resenas:            { type: DataTypes.INTEGER },
  nivel_precio:           { type: DataTypes.STRING(50) },
  national_phone_number:  { type: DataTypes.STRING(20) },
  direccion:              { type: DataTypes.STRING(255) },
  is_sponsored:           { type: DataTypes.BOOLEAN, defaultValue: false },
  active:                 { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at:             { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName:  "gastronomy",
  schema:     "market_data",
  timestamps: false,
});

export default Gastronomy;
