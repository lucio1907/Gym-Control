import { DataTypes } from "sequelize";
import sequelizeConfig from "../config/sequelize.config";

const SettingsModel = sequelizeConfig.define("setting", {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: "1"
  },
  gym_name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Gym Control Premium"
  },
  currency: {
    type: DataTypes.ENUM("ARS", "USD"),
    defaultValue: "ARS",
    allowNull: false
  },
  base_fee: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 15000
  },
  notif_payment_reminder: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  notif_debt_alert: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  notif_routine_update: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  timestamps: true,
});

export default SettingsModel;
