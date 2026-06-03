import { DataTypes } from "sequelize";
import sequelize from "../config/postgres.js";

const User = sequelize.define("User", {
  id_user:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre:          { type: DataTypes.STRING(100), allowNull: false },
  apellido:        { type: DataTypes.STRING(100) },
  email:           { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password_hash:   { type: DataTypes.STRING(256), allowNull: false },
  tlf:             { type: DataTypes.STRING(20) },
  municipality_id: { type: DataTypes.INTEGER, allowNull: false },  // ← FK real
  sexo:            { type: DataTypes.STRING(10), allowNull: false },
  age:             { type: DataTypes.INTEGER, allowNull: false },
  role:            { type: DataTypes.STRING(10), allowNull: false, defaultValue: "user" },
  created_at:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName:  "users",
  schema:     "user_data",
  timestamps: false,
});

export default User;