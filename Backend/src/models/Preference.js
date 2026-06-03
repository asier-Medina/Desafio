import { DataTypes } from 'sequelize'
import sequelize from '../config/postgres.js'

const Preference = sequelize.define('Preference', {
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:            { type: DataTypes.INTEGER, allowNull: false },
  rango_precio:       { type: DataTypes.STRING(20), allowNull: true },
  movilidad_reducida: { type: DataTypes.BOOLEAN, allowNull: true },
  municipios_interes: { type: DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: [] },
  updated_at:         { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName:  'preferences',
  schema:     'user_data',
  timestamps: false,
})

export default Preference