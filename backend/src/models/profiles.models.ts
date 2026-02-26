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
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM("admin", "user", "teacher"),
    defaultValue: "user",
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dni: {
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
  marked_days: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0
  },
  recovery_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  recovery_token_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  plan_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  teacher_id: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  paranoid: true,
});

export default ProfileModel;
