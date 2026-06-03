import { DataTypes } from 'sequelize'
import sequelize from '../config/postgres.js'

const Favorite = sequelize.define('Favorite', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:      { type: DataTypes.INTEGER, allowNull: false },
  entidad_id:   { type: DataTypes.INTEGER, allowNull: false },
  entidad_tipo: { type: DataTypes.STRING(20), allowNull: false },
  created_at:   { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName:  'favorites',
  schema:     'user_data',
  timestamps: false,
})

export default Favorite