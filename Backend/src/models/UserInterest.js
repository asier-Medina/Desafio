import { DataTypes } from "sequelize";
import sequelize from "../config/postgres.js";

const UserInterest = sequelize.define("UserInterest", {
  id_user:    { type: DataTypes.INTEGER, primaryKey: true },
  id_interes: { type: DataTypes.INTEGER, primaryKey: true },
}, { 
    tableName: "user_interests", 
    schema: "user_data", 
    timestamps: false 
});

export default UserInterest;