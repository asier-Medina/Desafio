import { DataTypes } from "sequelize";
import sequelize from "../config/postgres.js";

const User = sequelize.define("User", {
  id:            { type: DataTypes.INTEGER,  primaryKey: true, autoIncrement: true },
  name:          { type: DataTypes.STRING,   allowNull: false },
  email:         { type: DataTypes.STRING,   allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING,   allowNull: false },
  role:          { type: DataTypes.STRING,   allowNull: false, defaultValue: "user" },
}, {
  tableName: "users",
  timestamps: true
});

export default User;
