import { DataTypes } from 'sequelize'
import sequelize from '../config/postgres.js'

const User = sequelize.define('User', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
})

export default User