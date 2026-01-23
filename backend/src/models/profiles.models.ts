import { DataTypes } from "sequelize";
import sequelizeConfig from "../config/sequelize.config";

const ProfileModel = sequelizeConfig.define("profile", {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM("admin", "user"),
    defaultValue: "user",
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  billing_state: {
    type: DataTypes.ENUM("OK", "defeated", "pending"),
    defaultValue: "pending",
    allowNull: false,
  },
  expiration_day: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export default ProfileModel;
