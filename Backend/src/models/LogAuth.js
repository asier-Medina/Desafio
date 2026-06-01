import { DataTypes } from "sequelize";
import sequelize from "../config/postgres.js";

// Log de auditoría de auth 
const LogAuth = sequelize.define("LogAuth", {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: true },
  email:      { type: DataTypes.STRING,  allowNull: true },
  action:     { type: DataTypes.STRING,  allowNull: false }, // register | login | login_failed | logout | token_refresh
  ip:         { type: DataTypes.STRING,  allowNull: true },
  user_agent: { type: DataTypes.STRING,  allowNull: true },
  success:    { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  reason:     { type: DataTypes.STRING,  allowNull: true }
}, {
  tableName:  "log_auth",
  timestamps: true   // createdAt = fecha del evento
});

export default LogAuth;
