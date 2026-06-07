import { DataTypes } from "sequelize";
import sequelize from "../config/postgres.js";

const Municipality = sequelize.define("Municipality", {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre:         { type: DataTypes.STRING(100), allowNull: false },
  provincia:      { type: DataTypes.STRING(50), allowNull: false },
  nora_code:      { type: DataTypes.STRING(20), unique: true },
  province_code:  { type: DataTypes.STRING(5) },
  lat:            { type: DataTypes.FLOAT },
  lng:            { type: DataTypes.FLOAT },
}, { 
    tableName: "municipalities", 
    schema: "shared", 
    timestamps: false 
});

export default Municipality;
