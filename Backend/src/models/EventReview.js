import { DataTypes } from "sequelize";
import sequelize from "../config/postgres.js";

const EventReview = sequelize.define("EventReview", {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  event_id:   { type: DataTypes.INTEGER, allowNull: false },
  gastro_id:  { type: DataTypes.INTEGER },
  culture_id: { type: DataTypes.INTEGER },
  puntuacion: { type: DataTypes.INTEGER, allowNull: false },
  texto:      { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: "reviews", schema: "user_data", timestamps: false });

export default EventReview;
