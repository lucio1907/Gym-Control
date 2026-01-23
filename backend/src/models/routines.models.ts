import { DataTypes } from "sequelize";
import sequelizeConfig from "../config/sequelize.config";
import ProfileModel from "./profiles.models";

const RoutinesModel = sequelizeConfig.define("routines", {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  profile_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: ProfileModel,
      key: "id",
    },
  },
  routine_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  routine_content: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
  is_active: {
    // Rutina actual o vieja
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

export default RoutinesModel;
