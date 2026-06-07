import { DataTypes } from "sequelize";
import sequelize from "../config/postgres.js";

const Interest = sequelize.define("Interest", {
    id_interes: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre:     { type: DataTypes.STRING(100), allowNull: false },
    father_id: { type: DataTypes.INTEGER, allowNull: true },
    level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
    tableName: "interests",
    schema: "user_data",
    timestamps: false,
});

export default Interest;